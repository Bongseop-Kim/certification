"""questions.json + exams.json + verdicts.json (+ overrides.json) → usable.json. 사용: python3 build_usable.py <bookdir>

활용 가능 = 자동 판정 ok/minor 이면서 본문·정답에 글자 없는 불릿 줄이 없는 문항.
overrides.json은 사용자가 책에서 직접 확인한 문항을 덮어쓴다: {"q025": {"body": ..., "answer": ..., "explanation": ...}}.
덮어쓴 문항은 판정을 ok로 올린다(사용자 확인). 파서가 못 고치는 쪽은 이 파일에 쌓는다.
"""
import json, sys
from pathlib import Path

BARE = ("•", "·", "-")


def bare(t):
    return any(l.strip() in BARE for l in t.split("\n"))


def main(book):
    book = Path(book)
    verdict = {r["id"]: r for r in json.load(open(book / "verdicts.json"))}
    over = json.load(open(book / "overrides.json")) if (book / "overrides.json").exists() else {}
    items = []
    for q in json.load(open(book / "questions.json")):
        i = q["id"].split(":", 1)[1]
        items.append({"id": i, "source": "mock", "no": q["originalNo"], "pages": q["pdfPages"], "kind": q["kind"],
                      "body": q["body"], "answer": q["answerText"], "explanation": q["explanation"]})
    for q in json.load(open(book / "exams.json")):
        i = q["id"].split(":", 1)[1]
        items.append({"id": i, "source": f'{q["year"]}-{q["round"]}', "no": q["originalNo"], "pages": q["pdfPages"],
                      "answerPages": q["answerPages"], "kind": q["type"], "body": q["body"], "answer": q["answerText"],
                      "explanation": ""})
    use, skipped = [], {"broken": 0, "빈 불릿": 0, "정답 없음": 0}
    for it in items:
        v = verdict[it["id"]]
        it["verdict"], it["note"] = v["verdict"], v["reason"]
        if it["id"] in over:
            it.update({k: x for k, x in over[it["id"]].items() if not k.startswith("_")})
            ov = over[it["id"]]
            # AI가 손댄 문항 분류: inferred(문맥 추정) / restored(원본 조각 복원) / adjusted(사용자 확인 + AI 판단 일부)
            it["ai"] = ("inferred" if ov.get("_inferred") else "adjusted" if ov.get("_ai")
                        else "restored" if ov.get("_note", "").startswith("자동 복원") else None)
            it["verdict"], it["note"] = over[it["id"]].get("_check", "ok"), "overrides: " + over[it["id"]].get("_note", "사용자 확인")
        if it["verdict"] == "broken":
            skipped["broken"] += 1
        elif bare(it["body"]) or bare(it["answer"]):
            skipped["빈 불릿"] += 1
        elif len(it["answer"].strip()) < 2:
            skipped["정답 없음"] += 1
        else:
            use.append(it)
    (book / "usable.json").write_text(json.dumps(use, ensure_ascii=False, indent=1))
    print(f"활용 가능 {len(use)} | 제외 {skipped} | 덮어쓴 문항 {len(over)}")


if __name__ == "__main__":
    main(sys.argv[1])
