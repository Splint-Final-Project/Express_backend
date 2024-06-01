# Express_backend

## 구조 설명
1. server.js: 최상단의 위치하며, 최초 app 객체 생성과, 각 url의 루트 경로를 지정합니다.
2. routes 폴더: 각 세부 라우팅을 지정합니다. (스프링에서는 컨트롤러와 동일한 위치입니다.)
3. controllers 폴더: 각 도메인 로직이 담겨 있습니다. (스프링 : service)
4. models 폴더 : 실제 db와의 맵핑 관계, db의 구조를 js 객체로 만드는 역할을 담당합니다. (스프링: repository)
5. db 폴더: mongoose를 이용해 몽고 db와 연결하는 보일러 플레이트 (스프링: h2, 몽고 db)

   1 -> 2 -> ~ -> 5 형태로 깊어집니다.

## 서버 시작 방법

```bash
npm i
npm run server
```
