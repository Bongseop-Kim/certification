"""기출(문제 파트 103~267쪽 + 해설 파트 269~441쪽) → exams.json. 사용: python3 parse_exam.py <bookdir>

문제 파트는 회차 헤더(`정보보안기사 실기시험` + `20XX 기출문제 0N회`, 2025는 한 줄)로 나누고 `NN 지문`으로 문항을 자른다.
해설 파트는 `20XX년 0N회` 헤더와 `NN번 [유형]` 로 자른다. 회차의 `총 N문항`과 어긋나면 issues에 남긴다 — 추측해 채우지 않는다.
"""
import json, re, sys
from pathlib import Path
from parse import page_lines

Q_PAGES, A_PAGES = range(103, 268), range(269, 442)
NOISE = re.compile(r"^(합격 강의|풀이 시간.*|시행 일자|소요 ?시간|문항 ?수|총 \d시간|\d{4}년 \d+월|•|답\s*:?|•\s*답\s*:?)$")


def stream(book, pages, recover):
    out, iss = [], {}
    for n in pages:
        ls, i = page_lines(book / "frames" / f"{n:04d}.jsonl", recover)
        iss[n] = i
        out += [(n, l.strip()) for l in ls if l.strip()]
    return out, iss


def questions(book):
    st, iss = stream(book, Q_PAGES, False)
    exams, cur, typ = {}, None, None
    for idx, (pg, l) in enumerate(st):
        m = re.match(r"^(?:정보보안기사 실기시험\s*)?(20\d\d) 기출문제 0(\d)회$", l)
        if m and (l.startswith("정보보안기사") or st[idx - 1][1] == "정보보안기사 실기시험"):
            cur = exams.setdefault((int(m[1]), int(m[2])), {"total": None, "qs": {}, "pages": set(), "order": []})
            continue
        if cur is None:
            continue
        cur["pages"].add(pg)
        if (t := re.search(r"총 (\d+)문항", l)):
            cur["total"] = int(t[1])
            continue
        if re.fullmatch(r"\d", l) or l in ("단답형", "서술형", "작업형"):
            typ = l if l in ("단답형", "서술형", "작업형") else typ
            continue
        want = (cur["order"][-1] if cur["order"] else 0) + 1
        m = re.match(r"^(\d\d)((?: \d\d)*)(?:\s+(.*))?$", l)
        # ponytail: 번호가 한두 개 건너뛰어도 이어서 자른다(건너뛴 번호는 리포트에서 '시작을 찾지 못함').
        if m and want <= int(m[1]) <= want + 2 and m[3]:
            want = int(m[1])
            q = {"no": want, "group": [int(x) for x in m[2].split()], "type": typ, "pages": [pg], "lines": [m[3]]}
            cur["qs"][want] = q
            cur["order"].append(want)
        elif cur["order"] and not NOISE.match(l):
            q = cur["qs"][cur["order"][-1]]
            q["lines"].append(l)
            if pg not in q["pages"]:
                q["pages"].append(pg)
    return exams, iss


def answers(book):
    st, _ = stream(book, A_PAGES, True)
    exams, cur, blk = {}, None, None
    for pg, l in st:
        if (m := re.match(r"^(20\d\d)년 0(\d)회(?:\s+\d+p)?$", l)):
            cur, blk = exams.setdefault((int(m[1]), int(m[2])), {}), None
            continue
        if cur is None or re.fullmatch(r"\d+p", l):
            continue
        if (m := re.match(r"^(\d\d)번(?:\s+(단답형|서술형|작업형))?$", l)):
            blk = cur[int(m[1])] = {"type": m[2], "lines": [], "pages": [pg]}
        elif blk is not None:
            if not blk["lines"] and blk["type"] is None and l in ("단답형", "서술형", "작업형"):
                blk["type"] = l
                continue
            blk["lines"].append(l)
            if pg not in blk["pages"]:
                blk["pages"].append(pg)
    return exams


def main(book):
    book = Path(book)
    qx, iss = questions(book)
    ax = answers(book)
    out, report = [], []
    for key in sorted(qx):
        ex, ans = qx[key], ax.get(key, {})
        total = ex["total"]
        found, got = sorted(ex["qs"]), sorted(ans)
        rep = {"exam": f"{key[0]}-{key[1]}", "total": total, "questions": len(found), "answers": len(got)}
        report.append(rep)
        for no in range(1, (total or max(found)) + 1):
            q, a = ex["qs"].get(no), ans.get(no)
            problems = []
            if not q: problems.append("문제 파트에서 문항 시작을 찾지 못함")
            elif sum(len(x) for x in q["lines"]) < 20: problems.append("문제 본문이 비었거나 매우 짧음(원본 텍스트 손상 가능)")
            if not a: problems.append("해설 파트에서 'NN번' 블록을 찾지 못함")
            elif sum(len(x) for x in a["lines"] if x != "•") < 5: problems.append("해설 블록에 본문이 없음(접근성 텍스트에 노출되지 않은 쪽)")
            for p in (q or {"pages": []})["pages"]:
                problems += iss.get(p, [])
            out.append({
                "id": f"{book.name}:{key[0]}-{key[1]}:q{no:02d}", "year": key[0], "round": key[1], "originalNo": f"{no:02d}",
                "type": (a or {}).get("type") or (q or {}).get("type"), "groupWith": (q or {}).get("group", []),
                "pdfPages": (q or {}).get("pages", []), "answerPages": (a or {}).get("pages", []),
                "body": "\n".join((q or {}).get("lines", [])), "answerText": "\n".join((a or {}).get("lines", [])),
                "status": "needs-review", "issues": problems,
            })
    return out, report


if __name__ == "__main__":
    res, rep = main(sys.argv[1])
    Path(sys.argv[1], "exams.json").write_text(json.dumps(res, ensure_ascii=False, indent=1))
    Path(sys.argv[1], "exams-report.json").write_text(json.dumps(rep, ensure_ascii=False, indent=1))
    bad = [r for r in rep if not (r["total"] == r["questions"] == r["answers"])]
    print(f"{len(res)} items, {len(rep)} exams, mismatched exams: {len(bad)}")
    for r in bad: print(" ", r)
