#!/usr/bin/env python3
"""questions/<exam>/<source>.json -> Supabase.

exam은 파일이 든 디렉터리 이름에서 가져온다(questions/written/... -> 'written').
같은 source를 다시 밀어넣으려면 --replace 로 그 회차만 지우고 새로 넣는다.
questions_uniq(exam, subject, md5(body)) 때문에 중복 insert는 DB가 막는다.

사용법:
    python3 scripts/push_questions.py questions/written/2023-03-11.json [--replace]
"""

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

DROP = {"no"}  # JSON에만 있는 필드. 컬럼이 아니다.


def env(repo: Path) -> tuple[str, str]:
    values = {}
    for line in (repo / ".env.local").read_text().splitlines():
        if "=" in line and not line.startswith("#"):
            k, _, v = line.partition("=")
            values[k.strip()] = v.strip()
    try:
        return values["VITE_SUPABASE_URL"], values["VITE_SUPABASE_ANON_KEY"]
    except KeyError as e:
        raise SystemExit(f".env.local 에 {e} 가 없다") from e


def request(url: str, key: str, method: str, body: bytes | None = None) -> str:
    req = urllib.request.Request(url, data=body, method=method, headers={
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation" if method == "POST" else "count=exact",
    })
    try:
        with urllib.request.urlopen(req) as res:
            return res.read().decode()
    except urllib.error.HTTPError as e:
        raise SystemExit(f"{method} {url}\n  {e.code} {e.read().decode()}") from e


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    path = Path(sys.argv[1]).resolve()
    repo = Path(__file__).resolve().parent.parent
    url, key = env(repo)
    endpoint = f"{url}/rest/v1/questions"

    exam = path.parent.name
    rows = json.loads(path.read_text())
    source = rows[0]["source"]
    assert all(r["source"] == source for r in rows), "한 파일에 여러 회차가 섞여 있다"

    if "--replace" in sys.argv:
        q = urllib.parse.urlencode({"source": f"eq.{source}", "exam": f"eq.{exam}"})
        request(f"{endpoint}?{q}", key, "DELETE")
        print(f"기존 {exam}/{source} 삭제")

    payload = [{**{k: v for k, v in r.items() if k not in DROP}, "exam": exam} for r in rows]
    inserted = json.loads(request(endpoint, key, "POST", json.dumps(payload).encode()))
    print(f"{path.relative_to(repo)}  {len(inserted)}행 insert  (exam={exam}, source={source})")


if __name__ == "__main__":
    main()
