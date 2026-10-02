"""usable.json → questions/practical/igijeok-2026.json. 사용: python3 export.py <bookdir> <out.json>

필기 풀(`questions/written`)과 형식이 달라(서술·복수 빈칸) 섞지 않는다. 채점은 자가 채점(grading: "self").
본문 끝에 딸려 온 파트 제목('2 작업형')과 연속 중복 줄만 정리한다. 내용은 고치지 않는다.
"""
import json, re, sys
from pathlib import Path

TAIL = re.compile(r"^\d\s*(단답형|서술형|작업형)$")
# 사이트 분류(유형별 3종). 원래 kind는 그대로 두고 type만 접는다.
TYPE = {"단답형": "short", "term": "short", "multi-blank": "short", "서술형": "essay", "descriptive": "essay", "작업형": "task"}


def clean(text):
    out = []
    for l in text.split("\n"):
        if out and out[-1] == l:
            continue
        out.append(l)
    while out and TAIL.match(out[-1].strip()):
        out.pop()
    return "\n".join(out).strip()


def main(book, dest):
    items = json.load(open(Path(book, "usable.json")))
    out = []
    for it in items:
        mock = it["source"] == "mock"
        key = f"igijeok-2026:mock:{it['no']}" if mock else f"igijeok-2026:{it['source']}:{it['no']}"
        y, r = (None, None) if mock else it["source"].split("-")
        out.append({
            "key": key,
            "source": "이기적 2026 정보보안기사 실기 기출 600제 · " + ("실전 모의고사 " + it["no"] if mock else f"{y}년 {r}회 {it['no']}번"),
            "kind": it["kind"],
            "type": TYPE[it["kind"]],
            "grading": "self",
            "body": clean(it["body"]),
            "answer": clean(it["answer"]),
            "explanation": clean(it["explanation"]) or None,
            "pages": it["pages"],
            "check": it["verdict"],  # ok | minor — 책과 대조 전 자동 판정
        })
    Path(dest).parent.mkdir(parents=True, exist_ok=True)
    Path(dest).write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n")
    print(f"{len(out)} → {dest}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
