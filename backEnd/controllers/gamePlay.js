const { User, Room, Question, Drawing } = require('../models');


// const users = async()=>{
//     const playRoom = await Room.findOne({where: {play : 1}})
//     const playUser = 
// }


// 해당 게임방의 정보를 받는다.
// socket으로 넘어갔을 테니 게임 방의 정보는 게임 방의 id값만 불러와지면 된다.
// 제시어를 받는다.
// 1. room id 값을 걸러내 배열로 만든다.
// 2. 제시어를 받는다.
// 그림을 그린다.
// 1. 그림의 url을 content에 담는다.
// 2. 그림의 room id, user, question id를 담는다.
// 그림을 확인하고 제시어를 받는다.


// 그린 그림을 db에 저장한다.
exports.DrawingAdd = async (req, res) => {
    try {
        const { room, decode } = req;
        // console.log("지금 방 정보를 확인할 수 있다고???",room)

        const videoData = req.file.buffer;
        const drawing = await Drawing.create({
            content: videoData,
            user_primaryKey: decode.id,
            room_primaryKey: room.id
        });
        const lastDrawing = drawing.id;
        const drawing2 = await Drawing.findOne({where : {id : lastDrawing}});
        // res.sendStatus(200);
        res.status(200).json({ drawing, lastDrawing });

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}

//그림을 보여주는 함수
exports.viewVideo = async (req, res) => {
    try {
        const { Drawid } = req.body;
        const draw = await Drawing.findOne({ where: { id: Drawid } });
        const videoData = draw.content;
        res.status(200).set({
            'Content-Type': 'video/webm',
            'Content-Length': videoData.length
        }).send(videoData);
        // res.writeHead(200, {
        //     'Content-Type': 'video/webm',
        //     'Content-Length': videoData.length
        // });
        // res.end(videoData);

    } catch (error) {
        console.log("viewVideodddd")
        console.log(error);
    }
}

// 그림 저장 시, 저장한 그림의 id 값을 question테이블에 저장하는 함수
exports.DrawQueUpdate = async (req, res) => {
    try {
        const { decode, room } = req;
        const { painter, lastDrawing, viewIndex } = req.body;


        // 해당룸, 해당유저의 row를 찾아 제시어에 추가함
        const Insert = [];
        Insert.push(painter);
        Insert.push(lastDrawing);
        const queNum = viewIndex[0];
        const queContent =[];
        queContent.push(viewIndex[1]);
        queContent.push(Insert.toString());

        await Question.update({content: queContent.toString()}, {where: {id: queNum}})
        res.send();


    } catch (error) {
        console.log(error)
    }
}


// 첫 번째 제시어를 입력하는 함수
exports.firstQuestionInput = async (req, res) => {
    try {
        const { value } = req.body;
        const { decode } = req;
        const { room } = req;
        const question2 = await Question.findOne({ where: { user_primaryKey: decode.id, room_primaryKey: room.id } })
        if (question2 == null) {
            // 해당 방, 해당 유저가 입력한 제시어가 없으면 question db에 생성한다.
            await Question.create({
                content: value,
                user_primaryKey: decode.id,
                room_primaryKey: room.id
            })
        }



        // }
        res.send()
    } catch (error) {
        console.log(error);
    }
}


// 두 번째 제시어를 입력하는 함수
exports.TwoQuestionInput = async (req,res)=>{
    try {
        const { room } = req;
        const {id, value, queValue} = req.body;

    
        // 현재 제시어의 데이터값
        const isQue = await Question.findOne({where: {room_primaryKey: room.id, id: queValue}})
        // 제시어의 content 값
        const isCon = isQue.dataValues.content;
        // content값 배열화
        const isArr = isCon.split(',');
        
        const Insert = [];
        Insert.push(isCon);
        Insert.push(id);
        Insert.push(value);
        const content = Insert.toString();
    
        await Question.update({content : content}, {where: {id:queValue}})
        res.send();
    } catch (error) {
        console.log(error);
        
    }

}




//제시어를 보여주는 함수
exports.QuestionView = async (req, res) => {
    try {
        const { room, decode } = req;
        const isroomQue = await Question.findAll({ where: { room_primaryKey: room.id } })
        const roomManager = room.room_manager;
        const usersInRoom = room.users_in_room.split(",").map(Number);

        const questionData = isroomQue
            .map((i) => {
                const id = i.dataValues.id;
                const content = i.dataValues.content;
                const user_primaryKey = i.dataValues.user_primaryKey;
                return [id, content, user_primaryKey];
            })
            .sort((a, b) => {
                const aIndex = usersInRoom.indexOf(a[2]);
                const bIndex = usersInRoom.indexOf(b[2]);

                if (a[2] === roomManager) return -1; // room_manager를 가장 앞에 위치
                if (b[2] === roomManager) return 1; // room_manager를 가장 앞에 위치

                return aIndex - bIndex; // users_in_room 순서대로 정렬
            });


        const resultData = { questionData: questionData, userID : decode.id};

        res.send(resultData);


    } catch (error) {
        console.log(error);

    }

}
exports.getUserinfo= async(req,res)=>{
    try {
       
        const { id } = req.body;
        const {room}=req;
        let adf=[];
        for(let i =0;i<id.length;i++){
            let Que = await User.findOne({ where: { id: id[i] } })
            adf.push(Que);
        }
        adf.push(room);

        res.json(adf);
    } catch (error) {
        console.log(error);
    }

    
}

exports.RoomDelete = async(req,res)=>{
    try {
        const {id} =req.body;
        await Room.destroy({where:{id:id}});
        res.json();

    } catch (error) {
        console.log(error);
    }

}