"""단답 카드 빌더. 과목별 카드 목록(python 튜플)을 questions/written/short-<subject>.json으로 쓴다.
ponytail: 카드는 코드에 데이터로 둔다. 편집 → python3 scripts/short/build.py <subject> → npm run check.
튜플: (body, answer, note). note는 근거(기출 회차#번호 / 표준·조문 / notes IMG). 없으면 카드를 만들지 않는다."""
import json, sys, importlib

def build(subject):
    cards = importlib.import_module(f'cards_{subject}').CARDS
    seen = {}
    out = []
    for i, (body, answer, note) in enumerate(cards, 1):
        assert note.strip(), f'#{i} note 없음: {body}'
        assert '(' not in answer and ')' not in answer, f'#{i} 정답에 괄호: {answer}'
        assert len(answer) <= 30, f'#{i} 정답 30자 초과: {answer}'
        norm = answer.lower().replace(' ', '')
        if norm in seen:
            print(f'  경고 #{i} 정답 중복 "{answer}" (#{seen[norm]}) — body가 다른지 확인')
        seen.setdefault(norm, i)
        out.append({
            'key': f'short-{subject}#{i}', 'no': i, 'subject': subject, 'type': 'short',
            'body': body, 'stimulus': None, 'choices': None, 'answer': answer,
            'note': note, 'source': f'short-{subject}',
        })
    path = f'questions/written/short-{subject}.json'
    with open(path, 'w') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print(f'{path}: {len(out)}장')

if __name__ == '__main__':
    sys.path.insert(0, 'scripts/short')
    for s in sys.argv[1:]:
        build(s)
