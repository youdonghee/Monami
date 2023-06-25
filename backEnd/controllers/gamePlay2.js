const { User, Room, Question, Drawing } = require('../models');



// 그린 그림을 db에 저장한다.
exports.DrawingAdd = async(req,res)=>{
    try {
        // 게임 중인 방의 정보를 불러온다. socket으로 구현 되었을 때 수정해서 작업한다.
        const playRoom = await Room.findOne({where: {id : 1}})
        const { url } = req.body;
        await Drawing.create({
            content : url
        })
        
    } catch (error) {
        console.log(error)
    }
}

// 그림을 보여주는 함수
exports.viewVideo = async(req,res)=>{
    const draw = await Drawing.findOne({where: {id : 9}});
    const data = draw.content
    res.send(data)
}