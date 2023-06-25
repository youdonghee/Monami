

const { decode } = require('jsonwebtoken');
const {User, Post , Comment} = require('../models/index');
const path = require("path");
const { error } = require('console');


const { Op } = require('sequelize');    // 태그 검색 하기 위해 필요 


// [READ] 게시판에서 모든 게시글 보여주기 
    // exports.allBoardView = async (req, res) => {
    //     // 보여주는 쿼리 쓰고 

    //     // res 하기 
    // }

// [READ] 글쓰기 페이지 보여주기 
    exports.boardCreateView = async(req, res) => {

        if (req.decode && req.decode.id) {
            console.log("req.decode.id 👉👉👉👉👉" , req.decode.id )
        } else {
            console.log("req.decode is undefined.")
        }


        console.log("☝☝☝☝☝☝☝☝☝☝☝☝☝☝☝☝☝☝☝☝☝☝☝☝☝☝☝")
        console.log(req.decode)
        console.log(req.decode.id)

        console.log("🎏🎏🎏🎏🎏🎏🎏 여기까지 옴!!!!! ")
        // res.redirect("/boardCreate.html")
}


// [CREATE] 게시판 글쓰기 
    exports.boardCreate = async (req, res) => {
        const {file, body, decode} = req;
        console.log("decodedecodedecode",decode);

        console.log(decode.user_id);
        // 1) 저장할 데이터 솎아내기 
        console.log("📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌" , req);
            
            console.log("req 에서 file, body 분리 됐나 확인 👇 @boardController")
            // console.log("req.body, req.file : " , req.body, req.file)

            // console.log("req.decode 값 확인 👇 @boardController")
            // console.log(req.decode)

    
        // 2) sequelize 상속받은 Post 객체로 쿼리 날리기 
        try {
            const newPost = await Post.create({
                user_id : decode.user_id, 
                    // req.decode 로 변환 가능 
                    // 임의로 넣음 ✅✅
                    // login 성공하면 👉 거기에서 가져오기 ✅✅ 
                    // 사용자의 ID 가 이쪽으로 들어갈 수 있게 해야 함. 
                
                status : 1,
                    // [기본값] 1로 설정
                    // [고민]
                        // 공개 = 1 = 게시판에서, 모두에게 다 보임,  
                        // 삭제 = 0 = 게시판에서, 삭제. | 마이페이지에는 있음. | 

                views : 1,
                    // 제목이 클릭되면 -> 숫자가 올라가게? 
                    // [기본값] 1로 설정 
                        // models > post.js 에서 'defaultValue: 1' 이렇게 설정할 수도 있어. ✅✅ 
                    // [추가할 일]
                        // item 덩어리가 클릭되면 > 여기가 숫자가 올라가게 하기 

                user_primaryKey : req.decode.id,    // 현재 dj 가 id 2번이라 임시로
                    // [TODO ✅]
                        // islogin 에서 가져오기? 
                        // user 가 만들어지는 순간 id 를 파악해서 가져오기 
                            // const id = newPost.id; 이것 처럼 

                    // [이슈]
                        // 이 지금 로그인 한 계정은 user 테이블에 들어가고, 그 user 테이블의 id 가 있겠지 
                        // decode.id 에 찍힌 아이디가, 바로 그 user 테이블에 있는 그 id 인건가? ❓❓❓
                        // 이게 살짝 불확실해 ⭐⭐⭐⭐⭐

                title : body.title, 
                content : body.content, 
                tags : body.tags,
                post_img : file.filename,       
                    // [해석] 이 주소를 img 태그의 src 에 넣으면 보여진다.
                    
            })


            // POST 생성 후 User 의 exp 1 증가 | ⭐⭐⭐⭐⭐⭐⭐⭐ 
                const user = await User.findOne(
                    {where : {id : req.decode.id}}
                );

                if (user) {
                    user.exp += 1
                    await user.save();
                } else { 
                    console.log("exp 증가 저장 못 했어")
                }


                
            // 3) 사용자가 봤으면 하는 화면으로 redirect 시키기
                
                // 방금만들어진 post 의 id 값 가져오기
                const id_post = newPost.id;
                console.log("id가 찍혀? 👇 @boardController > boardCreate")
                console.log(id_post)

                        res.json({ redirectURL: `/board/item/${id_post}` });


            } catch (error) {
            console.log(error)
        }

    }


// [read] 게시글 상세 페이지 보여주기
    exports.boardItemView = async (req, res) => {


        try {
            // 0) 필요한 값 확인 및 할당
                console.log("@ boardController > boardItemView 입성")
                console.log("islogin 실행 후 값 들어오는지 보자 💁‍♀️" )
                console.log("islogin 실행 후 값 들어오는지 보자 💁‍♀️" ,  req.decode)

                const _userTable_ID = req.decode.id 
                const _userTable_userId = req.decode.user_id 
                const postId = req.query.id;

            // 1) 로그인한 유저 정보 
                const loginUser = {
                    _userTable_ID : _userTable_ID, 
                    _userTable_userId : _userTable_userId
                }

            // 2) User 테이블에서, data 가져오기
                const userWithPosts = await User.findOne({
                    where : {id : _userTable_ID},   
                        // ✅ 현재 dj 가 id 2 라서 설정함
                        // 이제, 세션에 저장된걸로 대체하기 : _userTable_ID
                    include : [
                        {model : Post}
                    ]
                });

                console.log(" userWithPosts 데이터 확인 @boardItemView" )
                // console.log(" userWithPosts 데이터 확인 @boardItemView" , userWithPosts)
            
            // 2) Post 테이블에서, data 가져오기
                const postWithComments = await Post.findOne({
                    where : {id : postId}, 
                        // post 테이블 id 8번에 댓글이 여러개 있어 설정함
                        // 여기에 지금 작성중인 postId 값이 넘어와야 함 
                        // axios 를 통해 넘어올 수 밖에 없는데? 
                    include : [
                        {   
                            model : Comment , 
                            include : {model : User}
                        } , 
                        {   
                            model : User
                        }
                    ]
                });

            // 5) 결과 합치기
                const result = {
                    user : userWithPosts, 
                    post : postWithComments,
                    loginUser : loginUser,
                    comment : postWithComments,
                }
                console.log("게시글 상세에서 보여줄 데이터가 다 들어있나 @boardItemView")
                // console.log("게시글 상세에서 보여줄 데이터가 다 들어있나 @boardItemView" , result)
            
            // 6) 결과 보내기 
                res.json(result)

        } catch (error) {
            console.error(error);
        }
    }


// [read] params 로 id 넣었을 때, 보여지는거 
    exports.boardParamsView = async (req, res) => {
        try {
            // 1) 값 들어오는지 확인 
                console.log("@Controller > boardParamsView 입장 👇 ")
                // console.log("req.params.id 확인👉" , req.params.id)

                console.log("게시글 클릭한 유저 = view 1 증가, 누구? " , req.params.id_post)

            // 2) 이걸 거쳤다 = 봤다 = view 1 증가! 

                // 클릭된 게시글 ID 
                    const clickedPostID = req.params.id_post
            
                // post 테이블에서 postid 에 해당하는 row 찾기 | 좋아요 버튼 증가에서 만든거 가져옴 ✅
                const post = await Post.findByPk(clickedPostID)
                
                // 찾았는데 없으면 에러 메시지
                if(!post) {
                    console.log("그 포스트 id 에 해당하는 포스트 없어");
                    return
                }

                // 있으면, views 속성 값 1 증가 
                await post.increment('views' , {by : 1});
                
                // 클릭한 유저 이름을 추가 👉 여기에선 굳이 할 필요는 없음 | 좀 더 심도있는 데이터 분석을 하려면 필요 
                    // const clickeUserUpdatePost = await post.update( {likeClickUser : clickedPostUserID} );

                // views 업데이트 한거 확인 
                console.log("조회수 숫자 업데이트 함!" );
                

            // 3) boardItem 보여주기 
                // [지금 버전] sendFile | 그냥 file 을 직접 보낸다.
                    res.sendFile(path.join(__dirname , "../../frontEnd/boardItem.html"))


        } catch (error) {
            console.log(error)
            
        }
    }


// [create] 게시판 댓글 생성 
    exports.boardCommentCreate = async (req, res) => {
    
        try {
            // 1) 저장할 데이터 확인
                console.log("@@@ boardController > boardCommentCreate 진입!")
       

            // 2) sequelize 상속받은 Comment 객체로 쿼리 날리기 
                const newComment = await Comment.create({
                    // 댓글 작성 내용
                    content : req.body.content,
                    
                    // 댓글 작성한 유저의 user 테이블 상의 id 
                    user_primaryKey : req.body.user_primaryKey,

                    // 댓글 작성 대상이 된 '대상 게시글의 id' (post 테이블에서 가져오기)                    
                    post_primaryKey : req.body.post_primaryKey,

                    // 대댓글 작성 대상이 되는 '대상 댓글의 id' (comment 테이블에서 가져오기)
                    id_of_targetComment : req.body.id_of_targetComment,

                    // 댓글 작성 대상이 되는 '대상 댓글을 쓴 유저' (comment 테이블에서 가져오기)
                    writer_of_targetComment : req.body.writer_of_targetComment
                })


            // 3) res 보내기 

                // 방금 만들어진 댓글 id 값 가져오기 
                    const id_newComment = newComment.id
                
                // 댓글의 대상이 되는 게시글의 id 가져오기 
                    const id_post = newComment.post_primaryKey
                    
                // 대댓글의 대상이 되는 원본 댓글 ID 가져오기
                    const reComment_original_commentID = newComment.id_of_targetComment

                    
                    
                        // 예전방식 - 작동함🔵
                        res.json({
                            redirectURL :  `/board/item/${id_post}` , 
                            newComment : newComment,
                        })
                    
                    console.log("res 보내기 완료")
                    // res.send("댓글 작성 완료👏👏")
                
            } catch (error) {
                console.log(error)
                
            }

    }

// [GET] comment 테이블 에서 필요한 데이터 가져오기 
    exports.commentDataGet = async (req, res) => {

        try {

            // comment 테이블에서 '타겟 댓글 id' 에 해당하는 row 가져오기 
                const originalCommentID = await Comment.findAll({
                    where : {id_of_targetComment : req.query.id_of_targetComment}
                });

                res.json(originalCommentID)
            
        } catch (error) {
            console.log(error)
        }
    }




// 좋아요 버튼 
    exports.likesBtn = async (req,res) => {

        const _likeClickUsers = []
        try {
            // 필요한 데이터 도착 확인


            const clickedPostID = req.body.clickedPostID;
            // const clickedPostUserID = req.body.likeClickUserUserID;
            const clickedPostUserID = req.decode.user_id;


            // [새로운 시도] 🔵 작동함 | 

                // 1. post 테이블에서 postid 에 해당하는 row 찾기
                const post = await Post.findByPk(clickedPostID)
                
                    // 1.1 찾았는데 없으면 에러 메시지
                    if(!post) {
                        console.log("그 포스트 id 에 해당하는 포스트 없어");
                        return
                    }

                // 2. 기존 체크 이력 확인 
                    // [해석] clickedPostUserID 이 값이 post테이블의 clickedPostID값  likeClickUser 속성값 안에 있니? 
                const clickedPostData = await Post.findOne({
                    where : {
                        id : clickedPostID
                    }
                })
                    console.log("🙌🙌🙌 클릭된 게시글에 들어있는 것 : " , clickedPostData)
                    console.log("방금 클릭한 게시글에 기존 좋아요 클릭 유저 : " , clickedPostData.likeClickUser)


                // 3. 기존에 좋아요 클릭한 유저 있는지 여부 확인 -> 비어있으면, 좋아요 명단에 추가
                if (clickedPostData.likeClickUser != null) {
                    _likeClickUsers.push(clickedPostData.likeClickUser.split(','));
                }
                    console.log("🙌🙌🙌🙌🙌🙌 이 게시글에 좋아요를 클릭한 유저들 모음 :" , _likeClickUsers)


                // 4. '좋아요 기존 명단' vs '방금 클릭한 유저' 비교 
                    // 👉 포함되어 있지 않다면 -> 1) 좋아요 1 증가 실행 2) 좋아요 명단에 추가 

                if (_likeClickUsers.length == 0 || !_likeClickUsers[0].includes(clickedPostUserID)) {

                    console.log("텅 비었거나, 포함되어 있지 않거나 👉 like increase 1 가능한 상황")
                    
                    // 중복 클릭 아니면, likes 속성 값 1 증가 
                    await post.increment('likes' , {by : 1});
                    
                    // 클릭한 유저 이름을 추가 
                    _likeClickUsers.push(clickedPostUserID)
                    console.log("좋아요 클릭 유저 추가" , _likeClickUsers)

                    const clickeUserUpdatePost = await post.update( {likeClickUser : _likeClickUsers.join(',')} );
    
                    // 유저 업데이트 한거 확인 
                    console.log("좋아요 클릭버튼 유저 업데이트 완료" , clickeUserUpdatePost);

                } else {
                    console.log("좋아요 중복 클릭임!🙅‍♀️🙅‍♂️")
                }
                
                // 클라에 보내기
                res.json({message : 'success'})

        
        } catch (error) {
            console.log(error)
        }
    }

    // 좋아요 증가 하는 함수 
    likeIncrease = async () => { 
        // 중복 클릭 아니면, likes 속성 값 1 증가 
        await post.increment('likes' , {by : 1});

        // 클릭한 유저 이름을 추가 
        _likeClickUsers.push(clickedPostUserID)
        console.log("좋아요 클릭 유저 추가" , _likeClickUsers)

        const clickeUserUpdatePost = await post.update( {likeClickUser : _likeClickUsers.join(',')} );

        // 유저 업데이트 한거 확인 
        console.log("좋아요 클릭버튼 유저 업데이트 완료" );
        console.log("좋아요 클릭버튼 유저 업데이트 완료" , clickeUserUpdatePost);
    }



// GET | [게시판 목록 보여주기]

exports.boardListPages = async (req, res) => {

    try {
        // 0) 필요한 데이터 들어왔는지 확인
            console.log("@ boardController > boardListPages 게시판 목록 입성")
            console.log("islogin 실행 후 값 들어는가🛴 " ,  req.decode)
            
   
        // 1) 로그인한 유저 정보 
            const _userTable_ID = req.decode.id 
            const _userTable_userId = req.decode.user_id 
            // console.log("@boardListPages | _userTable_ID " , _userTable_ID)
            // console.log("@boardListPages | _userTable_userId " , _userTable_userId)

            const loginUser = {
                _userTable_ID : _userTable_ID, 
                _userTable_userId : _userTable_userId
            }
            
       

        // 4) 전부 다, 외래키 활용해서, include로 가져오기 ⭐⭐⭐ 
            const postsWithCommentsUsers = await Post.findAll({
                include : [
                    {model : Comment},
                    {model : User}
                ]
            })

        // 5) 합치기 
            const result = {
                loginUser : loginUser, 
                postsWithCommentsUsers : postsWithCommentsUsers, 
                // post : postsByAllUser,  // 🔵 
            }
            // console.log("@boardListPages | '게시판 목록' 에 보여줄 데이터 다 들어왔나" , result)

        // 5) 클라이언트에 보내기 
            res.json(result)


    } catch (error) {
        console.log(error)
    }

}








// [GET] 페이지네이션
    exports.pagenation = async (req, res) => {

        try {
            // 0) 데이터 들어오는 값 확인
                console.log("@pagenation 입성 💁‍♀️💁‍♀️💁‍♀️💁‍♀️💁‍♀️💁‍♀️💁‍♀️💁‍♀️💁‍♀️💁‍♀️💁‍♀️💁‍♀️💁‍♀️💁‍♀️💁‍♀️💁‍♀️💁‍♀️💁‍♀️💁‍♀️💁‍♀️")

                // 정렬시 선택한 것
                const orderOption = req.query.order  // views, likes, createdAt 중 하나가 들어와야 함
                console.log("orderOption 잘 들어오나🚀🚀🚀🚀🚀🚀" , orderOption)
                
                // 한 페이지당 몇개 포스팅?;
                const postsPerPage = 8;

                // 사용자가 선택한 태그 

                // const tags = "음식"

                // 사용자가 보고싶어서 누른 페이지
                const page = req.query.num
                console.log("페이지 잘 들어오나 ✍✍✍✍✍✍✍✍" , page)

                // 한 페이지에서 몇 개의 포스팅을 보이게 할 것 인가. 
                const limit = postsPerPage     // 임시📛 

                // Post 테이블 중 '어디에서 부터' 데이터를 가져올 것 인가.
                const offset = limit * (page - 1)



   // 2) sequelize 페이지네이션  

            const postsWithCommentsUsers = await Post.findAll({
         

                limit : limit,        // 한 페이지에 몇 개의 포스팅이 보이게 할 것 인가
                offset : offset,        // post 에서, 몇 번째 POST ID 에서 찾을 것 인가 
                include : [
                    {model : Comment},
                    {model : User}
                ], 
                order : [[`${orderOption}` , "DESC"]]     // '들어온값' 이 '제일 위' 로 오도록
            
                
            });


            // 5) 합치기 
                const result = postsWithCommentsUsers
                    
     
                    
                    res.json({
                            // redirectURL : "/board/list/pagenation", 
                            data : result
                        })


            
        } catch (error) {
            
            console.log(error)
        }

    }


// [GET] 태그 누르면 보이는 페이지네이션 | ⭐⭐⭐ EXPORT 해줘야 해
    exports.tagsPagenation = async (req, res) => {

        try {
         
                // 정렬시 선택한 것
                const orderOption = req.query.order  // views, likes, createdAt 중 하나가 들어와야 함
                // 한 페이지당 몇개 포스팅?;
                const postsPerPage = 32;

                // 사용자가 선택한 태그 

                // const tags = "음식"
                const tags = req.query.tags

                // 사용자가 보고싶어서 누른 페이지
                const page = req.query.num

                // 한 페이지에서 몇 개의 포스팅을 보이게 할 것 인가. 
                const limit = postsPerPage     // 임시📛 

                // Post 테이블 중 '어디에서 부터' 데이터를 가져올 것 인가.
                const offset = limit * (page - 1)


            // 1) tags 하기 위한 설정 
                let tagCondition = undefined;

                if (tags) {
                    tagCondition = { [Op.like]: `%${tags}%` };
                } 
                    // tags 에 값이 있으면 -> tagCondition 이 업데이트 
                    // tags 에 값이 없으면 -> undefined  


            // 2) sequelize 페이지네이션  

            const postsWithCommentsUsers = await Post.findAll({
                where : {
                    tags : tagCondition     // tags 속성 기준으로 찾기
                }, 

                limit : limit,        // 한 페이지에 몇 개의 포스팅이 보이게 할 것 인가
                offset : offset,        // post 에서, 몇 번째 POST ID 에서 찾을 것 인가 
                include : [
                    {model : Comment},
                    {model : User}
                ], 
                order : [[`${orderOption}` , "ASC"]]     // 오름차순
                // order : [[`${orderOption}` , "DESC"]]     // 내림차순록
                
            });
            // console.log( "@pagenation , sequelize 에서 필요한거 받나? 

            // 5) 합치기 
                const result = postsWithCommentsUsers
                    
                console.log("@tags pagenation | 데이터 다 나가고 있니")
                console.log("@tags pagenation |💨💨💨💨💨💨💨💨💨💨💨" , result)

            // 5) 클라이언트에 
                    
                    
                    res.json({
                            // redirectURL : "/board/list/pagenation", 
                            data : result
                        })
                        

            
        } catch (error) {
            
            console.log(error)
        }

    }

// 특정 페이지로 들어왔을 때 보여주기
exports.pagenationView = (req, res) => {

    try {
    
        // console.log(req.result)
    } catch (error) {
        console.log(error)
        
    }

}



// [게시판 목록] [get] 기본 페이지 보여주기 
    exports.defaultView = (req, res) => {


        // 1) 데이터 가져오기 


        // 2) 데이터 랑 주소랑 같이 보내기 



        res.sendFile(path.join(__dirname , "../../frontEnd/boardList.html"))
    }

// [게시판 목록] [get] 기본 페이지 보여주기 
    exports.likesView = (req, res) => {

        console.log("likesView controller 입성!⭐⭐⭐⭐⭐⭐")
        // 1) 데이터 가져오기 


        // 2) 데이터 랑 주소랑 같이 보내기 

        res.sendFile(path.join(__dirname , "../../frontEnd/boardList_likes.html"))
    }

    
// [게시판 목록] [get] 기본 페이지 보여주기 
    exports.viewOrderView = (req, res) => {

        console.log("viewOrderView controller 입성!⭐⭐⭐⭐⭐⭐")
        // 1) 데이터 가져오기 


        // 2) 데이터 랑 주소랑 같이 보내기 

        res.sendFile(path.join(__dirname , "../../frontEnd/boardList_views.html"))
    }


// [게시판 수정] get | 기존 게시물 가져오기
    exports.boardEditView = (req, res) => {

        res.sendFile(path.join(__dirname , "../../frontEnd/boardItem_edit.html"))

    }


// [게시판 수정] post | 작성한 것 저장하기 
    exports.boardEditPost = async (req, res) => {

    // 정보 가져와지는지 보기 -> 🔵 도착확인
        console.log("@boardEditPost 도착! | 게시판 업로드 준비 완료 ") 

        const title = req.body.title;
        const desc = req.body.desc;
        const postId = req.body.postId; 
        console.log( "제목, 설명, postId 잘 들어오는지 확인 : " , title, desc, postId)


        try {
            // Post 테이블에서 수정할 게시물 찾기 
            const post = await Post.findOne({
                where : { id : postId }
            });

            if (post) {
                    post.title = title, 
                    post.content = desc, 
                    await post.save();
                
            // 경로랑, 데이터 같이 보내주기

            res.sendFile(path.join(__dirname , "../../frontEnd/boardItem.html"))

                // res.json({
                //     // 
                //     redirectURL :  `/board/item/${postId}` , 
                //     // newComment : newComment,
                // })
            
                
            } else {
                res.status(404).json({ message: 'Post not found' });
            }
            
        } catch (error) {
            console.log(error)
        }

    };



// [게시판 삭제]
    exports.boardDeletePost = async (req, res) => {

    // 정보 가져와지는지 보기 -> 🔵 도착확인
        console.log("@boardEditPost 도착! | 게시판 업로드 준비 완료 ") 

        const title = req.body.title;
        const desc = req.body.desc;
        const postId = req.body.postId; 
        console.log( "제목, 설명, postId 잘 들어오는지 확인 : " , title, desc, postId)


        try {
            // Post 테이블에서 수정할 게시물 찾기 
            const post = await Post.findOne({
                where : { id : postId }
            });

            if (post) {
                    await post.destroy();
                
            // 경로랑, 데이터 같이 보내주기            
            res.sendFile(path.join(__dirname , "../../frontEnd/boardList.html"))
                
            } else {
                res.status(404).json({ message: 'Post not found' });
            }
            
        } catch (error) {
            console.log(error)
        }


    }