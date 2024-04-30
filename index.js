// 필요한 모듈들을 불러옵니다.
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const secretText = 'superSecret';
const refreshSecretText = 'supersuperSecret';
const cookieParser = require('cookie-parser');

const posts = [
    {
        username: 'John',
        title: 'Post1'
    },
    {
        username: 'Han',
        title: 'Post2'
    }
]
let refreshTokens = [];

app.use(express.json());

app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('hi');
}) 

app.post('/login', (req, res) => {
    const username = req.body.username;
    const user = { name: username };

    //jwt를 이용해서 토큰 생성하기 payload + secretText
    // 유효기간 추가
    const accessToken = jwt.sign(user, 
        secretText, 
        {expiresIn: '30s'});

    // jwt를 이요해서 refreshToken도 생성
    const refreshToken = jwt.sign(user,
        refreshSecretText,
        { expiresIn: '1d'})
        refreshTokens.push(refreshToken)

        //refreshToken을 쿠키에 넣어주기
    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
    })
    res.json({ accessToken: accessToken });
})

app.get('/posts', authMiddleware, (req, res) => {
    res.json(posts);
})

function authMiddleware(req, res, next) {
    //토큰을 request headers에서 가져오기
    const authHeader = req.headers['authorization'];
    // Bearer ojgoerkogkerg.oerkgokerokg.okodkodskf
    const token = authHeader && authHeader.split(' ') [1]
    if (token == null) return res.sendStatus(401)

    // 토큰이 있으니 유요한 토큰인지 확인
    jwt.verify(token, secretText, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    })
}

app.get('/refresh', (req, res) => {
    
    //express.json()
   //쿠키가져오기
   const cookies = req.cookies;
   if(!cookies?.jwt) return res. sendStatus(403);

   const refreshToken = cookies.jwt;
   if(!refreshToken.includes(refreshToken)){
    return res.sendStatus(403);
   }

   //유효한 토큰인지 확인
   jwt.verify(refreshToken, refreshSecretText, (err, user) => {
    if(err) return res.sendStatus(403);
    //어세스토큰 생성하기
    const accessToken = jwt.sign({name: user.name}, 
        secretText,
        { expiresIn: '30s' }
        )
        res.json({ accessToken })
   })
})


// 서버가 4000번 포트에서 듣기를 시작합니다. 서버가 시작되면 콘솔에 메시지를 출력합니다.
const port = 4000;
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
