const Post = require('models/post');
const Joi = require('joi');
const { ObjectId } = require('mongoose').Types;

exports.checkObjectId = (ctx, next) => {
    const { id } = ctx.params;
    
    if(!ObjectId.isValid(id)){
        ctx.status = 400;
        return null;
    }

    return next();
};

exports.write = async (ctx) => {
    const schema = Joi.object().keys({
        title: Joi.string().required(),
        body: Joi.string().required(),
        tags: Joi.array().items(Joi.string()).required()
    });

    const result = Joi.validate(ctx.request.body, schema);

    if(result.error){
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }
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

exports.list = async (ctx) => {
    //page가 주어지지 않았다면 1로 간주
    //query는 문자열 형태로 받아 오므로 숫자로 변환
    const page = parseInt(ctx.query.page || 1, 10);

    //잘못된 페이지가 주어졌다면 오류
    if(page < 1){
        ctx.status = 400;
        return;
    }
    try{
        const posts = await Post.find()
            .sort({_id: -1})
            .limit(10)
            .skip((page - 1) * 10)
            .lean() //내용 길이 제한
            .exec();
        const postCount = await Post.countDocuments().exec();
        
        //body 길이가 200자 이상이면 생략
        const limitBodyLength = post => ({
            ...post,
            body: post.body.length < 200 ? post.body : `${post.body.slice(0,200)}...` 
        });
        ctx.body = posts.map(limitBodyLength);

        //마지막 페이지 알려 주기
        ctx.set('Last-Page', Math.ceil(postCount/10));
        ctx.body = posts;
    }catch(e) {
        ctx.throw(e, 500);
    }
    
}

exports.read = async (ctx) => {
    const { id } = ctx.params;
    try {
        const post = await Post.findById(id).exec();
        if(!post){
            ctx.status = 404;
            return;
        }
        ctx.body = post;
    } catch(e) {
        ctx.throw(e, 500);
    }
};

exports.remove = async (ctx) => {
    const { id } = ctx.params;
    try {
        await Post.findByIdAndRemove(id).exec();
        ctx.status = 204;
    } catch(e) {
        ctx.throw(e, 500);
    }
};

exports.update = async (ctx) => {
    const { id } = ctx.params;
    try {
        const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
            new: true
        }).exec();
        if(!post){
            ctx.status = 404;
            return;
        }
        ctx.body = post;
    } catch(e) {
        ctx.throw(e, 500);
    }
};
