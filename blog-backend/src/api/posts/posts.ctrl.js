const Post = require('models/post');

exports.write = async (ctx) => {
    const { title, body, tags } = ctx.request.body;

    //새 Post 인스턴스 생성
    const post = new Post({
        title, body, tags
    });

    try {
        await post.save(); //db에 등록
        ctx.body = post; //저장된 결과 반환
    } catch(e) {
        ctx.throw(e, 500);
    }
};

exports.list = (ctx) => {
    
}

exports.read = (ctx) => {
    
};

exports.remove = (ctx) => {
    
};

exports.update = (Ctx) => {
    
};
