# UTM · 유입 추적 정책

홈페이지(`/`)와 블로그(`/blog/`)는 같은 GA4 속성(`G-LTC8L11Y7J`)을 쓴다. 이 문서가 링크를 만들고 공유하는 유일한 규칙이다.

## 1. 원칙

1. **밖으로 내보내는 링크에만 UTM**을 붙인다 (SNS·메신저·메일·문서·QR).
2. **사이트 안 링크에는 UTM을 붙이지 않는다.** 붙이면 GA4가 세션 유입을 덮어써서 원래 어디서 왔는지 잃는다. 안쪽 이동은 이벤트로 남는다.
3. 공유는 항상 **단축 주소** `https://jemmajeon.github.io/go/?l=<id>` 로 한다. 목적지·UTM은 `links.json`에서 바꾸면 이미 뿌린 링크도 따라 바뀐다.
4. 값은 **영어 소문자 + 하이픈**만. 같은 뜻에 다른 철자 금지 (`Kakao`, `kakaotalk` ✕ → `kakao`).

## 2. 값 규칙

| 파라미터 | 뜻 | 값 |
|---|---|---|
| `utm_source` | 어디서 | `instagram` `kakao` `slack` `github` `naver_blog` `email` `resume` `qr` `threads` `linkedin` `direct_msg` |
| `utm_medium` | 어떤 방식으로 | `social` `messenger` `referral` `email` `document` `print` |
| `utm_campaign` | 무엇을 알리나 | `homepage` `blog` `project-<id>` `guide-<slug>` `log-<slug>` |
| `utm_content` | 같은 곳의 어느 자리 | `bio` `story` `post` `share` `signature` `header` `profile` … |

source별 기본 medium은 `links.json`의 `vocab.default_medium`. 새 source/medium이 필요하면 `vocab`에 먼저 추가한다.

## 3. 링크 만들기

- 관리 화면: <https://jemmajeon.github.io/utm/> (검색 노출 안 함) — 규칙대로 만들고 `links.json`에 넣을 한 줄을 준다.
- 등록: `links.json`의 `links`에 추가 → push. id는 `<도착>-<source>-<content>` (예: `home-insta-bio`).
- 지운 링크는 삭제하지 말고 남겨 둔다 (이미 퍼진 링크가 홈으로 떨어지지 않게).

## 4. 무엇이 기록되나 (GA4 이벤트)

| 이벤트 | 언제 | 주요 값 |
|---|---|---|
| `page_view` | 페이지 열림 (자동) | 세션 소스/매체/캠페인 = UTM |
| `link_relay` | 단축 주소를 탔을 때 | `link_id` `relay_source` `relay_medium` `relay_campaign` `relay_content` `destination` |
| `select_project` | 홈에서 프로젝트 카드 클릭 | `project_id` `project_category` `filter` |
| `view_project` | 프로젝트 페이지 열림 | `project_id` `referrer_host` |
| `filter_projects` · `archive_more` | 홈에서 분류 필터·아카이브 더보기 | `category` / `shown` |
| `nav_click` | 사이트 안 링크 클릭 | `link_text` `link_url` `zone` |
| `outbound_click` | 바깥 링크 클릭 (GitHub, 네이버지도 등) | `link_text` `link_url` `zone` `place` |
| `view_guide` | 블로그 안내서 열림 | `guide` `guide_kind` `guide_area` |

모든 이벤트에 **세션 첫 유입**(`ft_source` `ft_medium` `ft_campaign`)과 `site_section`(home/blog), `page_type`이 같이 붙는다.
→ "카톡으로 들어온 사람이 어떤 프로젝트를 눌렀나"를 이벤트 하나로 볼 수 있다.

들어올 때 붙은 UTM은 세션에 저장한 뒤 **주소창에서 지운다**. 방문자가 주소를 복사해 다시 공유해도 출처가 섞이지 않는다.

## 5. GA4에서 한 번만 할 일

관리 → 데이터 표시 → **맞춤 정의** → 맞춤 측정기준(이벤트 범위)으로 등록해야 보고서에서 보인다:
`link_id`, `relay_campaign`, `project_id`, `zone`, `place`, `guide`, `ft_source`, `ft_medium`, `ft_campaign`, `site_section`.

보는 곳:
- 유입 경로: 보고서 → 획득 → 트래픽 획득 (세션 소스/매체, 세션 캠페인)
- 단축 링크 성과: 탐색 → 자유 형식, 이벤트 이름 = `link_relay`, 측정기준 `link_id`
- 누가 무엇을 눌렀나: 탐색 → 경로 탐색 또는 자유 형식, 이벤트 `select_project`·`outbound_click` × `ft_source`

## 6. 개인정보

GA4는 사람을 특정하지 않는다 (누가가 아니라 **어떤 경로로 몇 명**이 왔는지). 링크 id·UTM 값에 실명·연락처를 넣지 않는다 (`kakao-friend-홍길동` ✕).

## 7. 옛 링크

블로그의 `/blog/go/?to=<key>`(hawaii·blog·home)는 이미 퍼져 있어 그대로 둔다. 새 링크는 모두 `/go/?l=<id>`.
