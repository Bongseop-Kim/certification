"""frames/*.jsonl(ax.swift dump-frames) → questions.json. 사용: python3 parse.py <bookdir> <first> <last> [startpage] [endpage]
startpage: 본문 시작 쪽. 책 구성 안내 쪽에 예시 문항 번호가 중복돼 있어 건너뛴다.

페이지 순서대로 001, 002, ... 연번 문항을 자른다. 결과는 status: needs-review — 사람이 검수한다.
"""
import json, os, re, sys
from pathlib import Path

MARK = re.compile(r"^\((?:[ㄱ-ㅎ]|\d+)\)|^\d+\.\s")


def norm(s):
    return re.sub(r"[\s•]", "", s)


LABEL = re.compile(r"[ㄱ-ㅎ]|[A-Z]|\d")


def clump_labels(v):
    """'•\n(\n(\n(\nㄱ\nㄴ\nㄷ\n) : …' 처럼 뭉친 노드에서 라벨 순서를 꺼낸다. '(' 개수와 라벨 개수가 같을 때만."""
    ls = [x.strip() for x in v.split("\n")]
    opens = sum(1 for x in ls if x == "(")
    labels = [x for x in ls if LABEL.fullmatch(x)]
    return labels if opens >= 1 and opens == len(labels) else None


def fix_labels(lines, clumps):
    """')'로 시작하는 줄(앞의 '( ㄱ'이 떨어져 나간 줄)에 라벨을 순서대로 되돌린다. 개수가 안 맞으면 건드리지 않는다."""
    found = [lb for lb in map(clump_labels, clumps) if lb]
    if not found:
        return lines
    labels = list(dict.fromkeys(x for lb in found for x in lb))  # 뭉침이 라벨 한 개씩이어도 모은다
    targets = [i for i, l in enumerate(lines) if l.startswith(")")]
    # 이미 온전한 '( ㄱ )' 줄의 라벨은 빼고, 빠진 라벨만 순서대로 배정한다
    have = {m for l in lines for m in re.findall(r"^[•\s]*\(\s*([ㄱ-ㅎA-Z\d])\s*\)", l)}
    missing = [lb for lb in labels if lb not in have]
    if len(targets) == len(missing):
        labels = missing
    elif len(targets) != len(labels):
        return lines
    out = list(lines)
    for i, lb in zip(targets, labels):
        out[i] = f"•( {lb} {lines[i]}"
    # 라벨을 붙인 줄 곁에 홀로 남은 불릿은 이제 중복이다
    drop = {j for i in targets for j in (i - 1, i + 1) if 0 <= j < len(lines) and lines[j].strip() == "•"}
    return [l for j, l in enumerate(out) if j not in drop]


def page_lines(path, recover=True):
    return _recover_lines(path) if recover else _legacy_lines(path)


def _recover_lines(path):
    """노드를 y로 줄 단위로 묶고, x 간격이 있으면 띄어쓴다.

    좌표가 (0,0)인 여러 줄 노드는 문단 전체를 한 번 더 담은 사본이고, 때로는 유일한 사본이다.
    통째로 버리지 않고 이미 나온 줄과 겹치지 않는 줄만 살린다(잘린 앞 사본은 긴 쪽으로 교체).
    """
    lines, issues, clumps = [], [], []
    cur, last = None, None
    pn = int(path.stem)

    def flush():
        nonlocal cur
        if cur is not None:
            lines.append(cur)
        cur = None

    def add_multi(v):
        flush()
        for l in v.split("\n"):
            k = norm(l)
            if len(k) < 2:  # 불릿 등 장식
                continue
            hit = next((i for i, x in enumerate(lines) if k in norm(x)), None)
            if hit is not None:
                continue
            part = next((i for i, x in enumerate(lines) if len(norm(x)) >= 6 and norm(x) in k), None)
            if part is not None:
                lines[part] = l  # 앞서 나온 잘린 사본을 완전한 줄로 교체
            else:
                lines.append(l)
                issues.append(f"p{pn} 중복 사본에서만 읽힌 줄 복구: {l[:30]!r}")

    for raw in path.read_text().splitlines():
        n = json.loads(raw)
        v = n["v"]
        if v.startswith("•\n"):
            clumps.append(v)
        if "\n" in v and n["w"] > 0 and (n["x"] or n["y"]) and not v.startswith("•\n"):
            v = " ".join(x.strip() for x in v.split("\n") if x.strip())
        if "\n" in v:
            add_multi(v)
            last = None
            continue
        same = last and abs(n["y"] - last["y"]) < last["h"] / 2
        if same:
            cur += (" " if n["x"] - (last["x"] + last["w"]) > 2 else "") + v
        else:
            flush()
            cur = v
        last = n
    flush()
    return fix_labels([l for line in lines for l in line.split("\n")], clumps), issues


def _legacy_lines(path):
    """구방식(문제 파트용): 노드를 y로 묶고, 앞이 불릿이거나 이미 나온 여러 줄 노드는 손상 조각으로 제외한다."""
    lines, issues, seen, clumps = [], [], "", []
    cur, last = None, None
    for raw in path.read_text().splitlines():
        n = json.loads(raw)
        v = n["v"]
        if v.startswith("•\n"):
            clumps.append(v)
        if "\n" in v and (v.startswith("•\n") or all(norm(l) in seen for l in v.split("\n") if len(norm(l)) >= 6)):
            issues.append(f"p{int(path.stem)} 텍스트 손상 조각 제외: {v!r}")
            continue
        if "\n" in v and n["w"] > 0 and (n["x"] or n["y"]):
            v = " ".join(x.strip() for x in v.split("\n") if x.strip())  # 한 줄 안에서 줄바꿈이 섞인 노드
        same = last and "\n" not in v and abs(n["y"] - last["y"]) < last["h"] / 2
        if same:
            cur += (" " if n["x"] - (last["x"] + last["w"]) > 2 else "") + v
        else:
            if cur is not None:
                lines.append(cur)
            cur = v
        last = n
        seen += norm(v)
    if cur is not None:
        lines.append(cur)
    return fix_labels([l for line in lines for l in line.split("\n")], clumps), issues


def split_answer(block):
    ans = [block[0]]
    seq = block[0].startswith("(1)")
    heads = {norm(MARK.sub("", block[0]))}
    for i, l in enumerate(block[1:], 1):
        if l.startswith(("①", "•", "기적의 TIP")) or norm(MARK.sub("", l)) in heads:
            break
        if not seq and not MARK.match(l):
            break
        ans.append(l)
        heads.add(norm(MARK.sub("", l)))
    return ans, block[len(ans):]


def main(book, first, last, startpage=1, endpage=9999, recover=True):
    book = Path(book)
    stream = []  # (page, line)
    issues_by_page = {}
    for p in sorted((book / "frames").glob("*.jsonl")):
        if not startpage <= int(p.stem) <= endpage:
            continue
        ls, iss = page_lines(p, recover)
        issues_by_page[int(p.stem)] = iss
        stream += [(int(p.stem), l) for l in ls]

    qs, want, cur = [], first, None
    for page, l in stream:
        m = re.match(rf"{want:03d}(?:\s+(.*))?$", l.strip())
        if m and want <= last + 1:
            if cur:
                qs.append(cur)
            if want > last:
                cur = None
                break
            cur = {"no": want, "pages": [page], "lines": [m.group(1)] if m.group(1) else []}
            want += 1
        elif cur:
            if page not in cur["pages"]:
                cur["pages"].append(page)
            cur["lines"].append(l)
    if cur:
        qs.append(cur)

    out = []
    for q in qs:
        L = q["lines"]
        a = next(i for i, l in enumerate(L) if norm(l) == "답:")
        e = next(i for i, l in enumerate(L) if l.strip() == "정답 & 해설")
        answer, expl = split_answer(L[e + 1:])
        body = "\n".join(L[:a])
        issues = [i for p in q["pages"] for i in issues_by_page[p]]
        kind = ("descriptive" if "서술" in L[0] or "기술" in L[0] or answer == ["해설 참조"]
                else "multi-blank" if len(answer) > 1 else "term")
        out.append({
            "id": f"{book.name}:q{q['no']:03d}", "originalNo": f"{q['no']:03d}", "pdfPages": q["pages"],
            "kind": kind, "body": body, "answerText": "\n".join(answer), "explanation": "\n".join(expl),
            "rawFiles": [f"frames/{p:04d}.jsonl" for p in q["pages"]], "status": "needs-review", "issues": issues,
        })
    assert [q["no"] for q in qs] == list(range(first, last + 1)), [q["no"] for q in qs]
    return out


if __name__ == "__main__":
    book, first, last = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
    res = main(book, first, last, int(sys.argv[4]) if len(sys.argv) > 4 else 1,
               int(sys.argv[5]) if len(sys.argv) > 5 else 9999,
               os.environ.get("RECOVER", "1") == "1")
    Path(book, "questions.json").write_text(json.dumps(res, ensure_ascii=False, indent=1))
    print(f"{len(res)} questions → {book}/questions.json")
