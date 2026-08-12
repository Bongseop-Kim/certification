#!/usr/bin/env python3
"""기출 PDF(전자문제집 CBT 교사용) -> questions JSON.

교사용 판본은 정답 보기만 ❶❷❸❹로 인쇄되고, 마지막 페이지에 정답표가 따로 있다.
둘을 각각 파싱해서 100문항 전부 일치하는지 대조한다 -- 이게 이 스크립트의 유일한 안전장치다.

사용법:
    python3 scripts/parse_exam.py <기출.pdf> <회차> [--out questions/written/<회차>.json]
예:
    python3 scripts/parse_exam.py ~/Downloads/정보보안기사20230311\\(교사용\\).pdf 2023-03-11
"""

import json
import re
import subprocess
import sys
from pathlib import Path

# 필기는 과목당 20문항 고정. 페이지 머리글의 "N과목" 표기는 페이지 단위라 경계로 못 쓴다.
SUBJECTS = ["system", "network", "app", "general", "law"]
PER_SUBJECT = 20

PLAIN = "①②③④"
MARKED = "❶❷❸❹"  # 정답으로 인쇄된 보기
CHOICE_RE = re.compile(f"[{PLAIN}{MARKED}]")
QSTART_RE = re.compile(r"^(\d{1,3})\.\s+")
# 러닝 헤더가 본문 줄 끝에 그대로 붙어 나온다. 통째로 지운다.
RUNNING_HEADER_RE = re.compile(r"(?:\d과목\s*:[^정]*)?정보보안기사\s*◐.*?◑\s*전자문제집 CBT\s*:\s*\S+")
FOOTER_RE = re.compile(r"^최강 자격증 기출문제 전자문제집 CBT")
TAIL_MARKER = "전자문제집 CBT 홈페이지"
ANSWER_ROW_RE = re.compile(f"^[{PLAIN}](\\s+[{PLAIN}])+\\s*$")
# 51/67/81번처럼 "확정답안 발표시 모두 정답처리" 안내가 본문에 붙어 나온다. 문제 문장이 아니므로 떼어낸다.
ERRATA_RE = re.compile(r"\(문제 오류로.*?\)")
FULLWIDTH = str.maketrans("＞＜（）", "><()")


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.translate(FULLWIDTH)).strip()


def pdf_to_lines(pdf: Path) -> list[str]:
    """-raw 는 2단 조판에서도 읽기 순서를 지킨다. -layout 은 두 단을 섞어버린다."""
    out = subprocess.run(
        ["pdftotext", "-raw", str(pdf), "-"],
        capture_output=True, text=True, check=True,
    ).stdout
    return out.splitlines()


def split_body_and_tail(lines: list[str]) -> tuple[list[str], list[str]]:
    for i, line in enumerate(lines):
        if line.startswith(TAIL_MARKER):
            return lines[:i], lines[i:]
    raise SystemExit(f"정답표 앞 구분자('{TAIL_MARKER}')를 못 찾았다. PDF 판본이 다른 듯하다.")


def clean(lines: list[str]) -> list[str]:
    out = []
    for line in lines:
        line = RUNNING_HEADER_RE.sub("", line).strip()
        if not line or FOOTER_RE.match(line):
            continue
        if re.fullmatch(r"\d과목\s*:.*", line):  # 과목 헤더 단독 줄
            continue
        out.append(line)
    return out


def parse_answer_key(tail: list[str]) -> dict[int, int]:
    """정답표: '1 2 3 ... 10' 다음 줄에 '① ① ② ...' 가 오는 형식."""
    key = {}
    for i, line in enumerate(tail):
        nums = line.split()
        if not nums or not all(n.isdigit() for n in nums):
            continue
        if i + 1 >= len(tail) or not ANSWER_ROW_RE.match(tail[i + 1]):
            continue
        answers = tail[i + 1].split()
        if len(answers) != len(nums):
            raise SystemExit(f"정답표 행 길이 불일치: {line!r} / {tail[i+1]!r}")
        for n, a in zip(nums, answers):
            key[int(n)] = PLAIN.index(a)
    return key


def split_choices(text: str) -> list[tuple[int, bool, str]]:
    """한 줄에 보기가 두 개 이상 들어있는 경우가 흔하다('❶ SCAN ② SSTF')."""
    hits = list(CHOICE_RE.finditer(text))
    out = []
    for j, m in enumerate(hits):
        mark = m.group()
        end = hits[j + 1].start() if j + 1 < len(hits) else len(text)
        idx = MARKED.index(mark) if mark in MARKED else PLAIN.index(mark)
        out.append((idx, mark in MARKED, text[m.end():end].strip()))
    return out


def find_joins(lines: list[str]) -> list[tuple[str, str]]:
    """이어붙일 경계 목록. 순수 연속 줄(문항 시작도, 보기도 아닌 줄)이 앞줄에 붙는다."""
    out = []
    for a, b in zip(lines, lines[1:]):
        if QSTART_RE.match(b) or CHOICE_RE.search(b):
            continue
        out.append((a, b))
    return out


def load_joins(path: Path, expected: int) -> list[bool]:
    """S=공백 / -=붙임. 사람이 정한 값이다. 파일이 없으면 전부 공백으로 두고 경고한다."""
    if not path.exists():
        print(f"경고: {path.name} 이 없다. 전부 공백으로 이어붙인다"
              f" -- 한글 단어가 갈라진다. --dump-joins 로 경계를 뽑아 판정할 것", file=sys.stderr)
        return [True] * expected
    flags = "".join(
        c for line in path.read_text().splitlines()
        if not line.lstrip().startswith("#")
        for c in line if c in "S-"
    )
    if len(flags) != expected:
        raise SystemExit(
            f"{path.name}: 판정값 {len(flags)}개인데 경계는 {expected}곳이다. 파일이 낡았다.")
    return [c == "S" for c in flags]


def parse_questions(lines: list[str], joins: list[bool]) -> list[dict]:
    questions, cur, ji = [], None, 0

    def glue(prev: str, nxt: str) -> str:
        nonlocal ji
        sep = " " if joins[ji] else ""
        ji += 1
        return prev + sep + nxt

    for line in lines:
        m = QSTART_RE.match(line)
        if m:
            if cur:
                questions.append(cur)
            cur = {"no": int(m.group(1)), "body": line[m.end():], "choices": [], "answer": None}
            continue
        hits = list(CHOICE_RE.finditer(line))
        if not hits:  # 순수 연속 줄
            if cur["choices"]:
                cur["choices"][-1] = glue(cur["choices"][-1], line)
            else:
                cur["body"] = glue(cur["body"], line)
            continue
        # 이 PDF에서는 보기 앞에 글자가 남는 줄이 0개다. 판본이 다르면 조용히 버리지 말고 멈춘다.
        if line[:hits[0].start()].strip():
            raise SystemExit(f"보기 앞에 글자가 남았다 -- 판본이 다르다: {line!r}")
        for idx, is_answer, text in split_choices(line):
            while len(cur["choices"]) <= idx:
                cur["choices"].append("")
            cur["choices"][idx] = (cur["choices"][idx] + " " + text).strip()
            if is_answer:
                cur["answer"] = idx
    if cur:
        questions.append(cur)
    assert ji == len(joins), f"이어붙임 {ji}회 != 판정값 {len(joins)}개"
    return questions


def main() -> None:
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    pdf, source = Path(sys.argv[1]).expanduser(), sys.argv[2]
    repo = Path(__file__).resolve().parent.parent
    out_path = Path(sys.argv[4]) if "--out" in sys.argv else repo / f"questions/written/{source}.json"

    stim_path = repo / f"scripts/stimulus/{source}.json"
    stimulus = {}
    if stim_path.exists():
        stimulus = {k: v for k, v in json.loads(stim_path.read_text()).items() if not k.startswith("_")}

    body_lines, tail = split_body_and_tail(pdf_to_lines(pdf))
    lines = clean(body_lines)
    boundaries = find_joins(lines)

    if "--dump-joins" in sys.argv:
        for i, (a, b) in enumerate(boundaries):
            print(f"{i:3d} {a[-14:]:>14} ¦ {b[:14]}")
        return

    key = parse_answer_key(tail)
    parsed = parse_questions(lines, load_joins(repo / f"scripts/joins/{source}.txt", len(boundaries)))

    total = len(SUBJECTS) * PER_SUBJECT
    assert len(parsed) == total, f"문항 수 {len(parsed)} != {total}"
    assert len(key) == total, f"정답표 {len(key)}개 != {total}"

    out, mismatch = [], []
    for q in parsed:
        no = q["no"]
        assert q["answer"] is not None, f"{no}번: ❶❷❸❹ 정답 표시가 없다"
        assert len(q["choices"]) == 4, f"{no}번: 보기가 {len(q['choices'])}개"
        if key[no] != q["answer"]:
            mismatch.append((no, key[no] + 1, q["answer"] + 1))
        body = normalize(q["body"])
        errata = ERRATA_RE.search(body)
        out.append({
            # attempts가 이 문제를 가리키는 키. DB에 questions 테이블이 없으므로
            # 회차+번호로 만든 이 문자열이 유일한 식별자다.
            "key": f"{source}#{no}",
            "no": no,
            "subject": SUBJECTS[(no - 1) // PER_SUBJECT],
            "type": "mc",
            "body": normalize(ERRATA_RE.sub("", body)),
            "stimulus": stimulus.get(str(no)),
            "choices": [normalize(c) for c in q["choices"]],
            "answer": str(q["answer"]),
            "explanation": None,
            "note": normalize(errata.group()[1:-1]) if errata else None,
            "source": source,
        })

    if mismatch:
        for no, table, mark in mismatch:
            print(f"  {no}번: 정답표 {table} vs 마크 {mark}", file=sys.stderr)
        raise SystemExit(f"정답 불일치 {len(mismatch)}건 -- 파싱을 신뢰할 수 없다")

    missing_stim = sorted(int(k) for k in stimulus if not any(q["no"] == int(k) for q in out))
    assert not missing_stim, f"지문만 있고 문항이 없다: {missing_stim}"

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")

    print(f"{out_path.relative_to(repo)}  {len(out)}문항")
    print(f"  정답 교차검증  정답표 {len(key)}개 == ❶❷❸❹ 마크, 불일치 0")
    print(f"  지문 박스      {len(stimulus)}개 주입")
    for i, s in enumerate(SUBJECTS):
        print(f"  {s:<8} {sum(1 for q in out if q['subject'] == s)}문항", end="\n" if i % 2 else "")


if __name__ == "__main__":
    main()
