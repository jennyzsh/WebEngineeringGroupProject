const { 
    User, 
    Post, 
    Tag,
    Comment,
    Picture
} = require('../db/model');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const fs = require('fs');

function getFormattedDatetime(t) {
    hr = ("0" + t.getHours()).slice(-2);
    min = ("0" + t.getMinutes()).slice(-2);
    sec = ("0" + t.getSeconds()).slice(-2);
    return t.getFullYear()+"-"+(t.getMonth()+1)+"-"+t.getDate()+" "+hr+":"+min+":"+sec;
}

async function getUser(userId){
    let whereOption = {};
    try{
        if(userId)whereOption.id = userId;
        let user = await User.findOne({
            where:whereOption,
            attributes:['id', 'username', 'email']
        })
        return user?user.dataValues:null
    } catch(e) {
        return null;
    }
}

async function findUser(email, password){
    let whereOption = {};
    try{
        if(email)whereOption.email = email;
        if(password)whereOption.password = password;

            let user = await User.findOne({
                where:whereOption,
                attributes:['id','username','email']
            });
            return user?user.dataValues:null
    }catch (e) {
        return null
    }
}

async function createUser(username, password,email){
    try{
        let result = await User.create({
            username,
            password,
            email
        });
        return result
    }catch (e) {
        console.error(e.message)
        return null
    }
}

async function getTag(tagId) {
    let whereOption = {}
    try{
        if (tagId)whereOption.id = tagId;
        let tag = await Tag.findOne({
            where: whereOption,
            attributes:['name']
        });
        return tag ? tag.dataValues['name'] : '';
    } catch (e) {
        return null;
    }
}

async function getPostTags(postId){
    let whereOption = {};
    tags_arr = [];
    try{
        if (postId)whereOption.postId = postId;
        let tags = await Tag.findAll({
            where:whereOption,
            attributes:['name']
        });
        if (!tags) return null;
        for (tag of tags){
            tags_arr.push(tag.dataValues['name']);
        }
        return tags_arr;
    }catch(e){
        return null;
    }
}

async function getUserPosts(userid) {
    let whereOption = {};
    posts_arr = []
    try {
        if (userid)whereOption.userId = userid;
        let posts = await Post.findAll({
            where: whereOption,
            attributes:['id', 'title', 'content', 'updatedAt', 'destination', 'startDate', 'endDate']
        });

        if (!posts) return null;
        for (post of posts) {
            let tags = await getPostTags(post.dataValues['id']);
            let updatedAt = getFormattedDatetime(post.dataValues['updatedAt']);
            p = {
                'id': post.dataValues['id'],
                'title': post.dataValues['title'],
                'tag': tags.join(', '),
                'updatedAt': updatedAt,
                'destination': post.dataValues['destination'],
            }
            posts_arr.push(p)
        }
        posts_arr.sort(function(a, b) {
            var c = new Date(a['updatedAt']);
            var d = new Date(b['updatedAt']);
            return d-c;
        });
        return posts_arr;
    }catch (e){
        return null;
    }
}

async function getPost(postId){
    let whereOption = {};
    try{
        if (postId)whereOption.id = postId;
        let post = await Post.findOne({
            where: whereOption,
            attributes:['id', 'userId', 'title', 'content', 'updatedAt', 'destination', 'startDate', 'endDate']
        });
        if(!post) return null;
        let tags = await getPostTags(post.dataValues['id']);
        post.dataValues['tag'] = tags.join(', ');
        let updatedAt = getFormattedDatetime(post.dataValues['updatedAt']);
        post.dataValues['updatedAt'] = updatedAt;
        post.dataValues['startDate'] = post.dataValues['startDate'].toDateString();
        post.dataValues['endDate'] = post.dataValues['endDate'].toDateString();
        return post.dataValues;
    }catch(e){
        return null;
    }
}

async function getPostForEdit(postId){
    let whereOption = {};
    try{
        if (postId)whereOption.id = postId;
        let post = await Post.findOne({
            where: whereOption,
            attributes:['id', 'userId', 'title', 'content', 'updatedAt', 'destination', 'startDate', 'endDate']
        });
        if(!post) return null;
        let tags = await getPostTags(post.dataValues['id']);
        post.dataValues['tag'] = tags.join(', ');
        let updatedAt = getFormattedDatetime(post.dataValues['updatedAt']);
        let start_date = getFormattedDatetime(post.dataValues['startDate']);
        let end_date = getFormattedDatetime(post.dataValues['endDate']);
        post.dataValues['updatedAt'] = updatedAt;
        post.dataValues['startDate'] = start_date;
        post.dataValues['endDate'] = end_date;
        
        return post.dataValues;
    }catch(e){
        return null;
    }
}

async function createPost(user_id, title, destination, start_date, end_date, content, tags, image) {
    //console.error(user_id, title, destination, start_date, end_date, content, tags, image)
    try{
        let new_post = await Post.create({
            userId: user_id,
            title: title,
            destination: destination,
            startDate: start_date,
            endDate: end_date,
            content: content
        });
        
        if(Array.isArray(tags)) {
            tags.forEach(async function(tag){
                let insert_tag = await Tag.create({
                    name: tag,
                    postId: new_post.id
                });
            });
        } else {
            let insert_tag = await Tag.create({
                name: tags,
                postId: new_post.id
            });
        }
        
        if(image !== undefined) {
            let dest_path = 'public/img/upload_images/' + new_post.id + '-' + image.name;
            fs.copyFileSync(image.path, dest_path);
            let insert_photo = await Picture.create({
                url: dest_path,
                userId: user_id,
                postId: new_post.id
            })
        }

        return true;

    }catch (e) {
        console.error(e.message)
        return null
    }
}

async function updatePost(post_id, user_id, title, destination, start_date, end_date, content, image) {
    try{
        let update_post = await Post.update({
            title: title,
            destination: destination,
            startDate: start_date,
            endDate: end_date,
            content: content
        },
        {
            where:{
                id: post_id
            }
        });
        
        if(image !== undefined) {
            let dest_path = 'public/img/upload_images/' + post_id + '-' + image.name;
            fs.copyFileSync(image.path, dest_path);
            let insert_photo = await Picture.create({
                url: dest_path,
                userId: user_id,
                postId: post_id
            })
        }

        return true;

    }catch (e) {
        console.error(e.message)
        return null
    }
}

async function delPost(postId){
    let whereOption = {};
    try{
        if (postId)whereOption.id = postId;
        let res = await Post.destroy({
            where: whereOption
        });
        return res;
    }catch(e){
        return null;
    }
}

async function poComment(postId, userId, content){
    try{
        let result = await Comment.create({
            postId,
            content,
            userId
        });
        return result
    } catch (e) {
        console.log(e);
        return null;
    }
}

async function getComments(postId){
    let whereOption = {};
    comments_arr = []
    try{
        if(postId)whereOption.postId = postId;
        let comments = await Comment.findAll({
            where: whereOption,
            attributes:['id', 'content', 'userId', 'updatedAt']
        });

        if (!comments) return null;
        for (comment of comments) {
            let user = await getUser(comment.dataValues['userId']);
            comment.dataValues['username'] = user.username;
            let updatedAt = getFormattedDatetime(comment.dataValues['updatedAt']);
            comment.dataValues['updatedAt'] = updatedAt;
            comments_arr.push(comment.dataValues)
        }
        comments_arr.sort(function(a, b) {
            var c = new Date(a['updatedAt']);
            var d = new Date(b['updatedAt']);
            return d-c;
        });
        return comments_arr;
    }catch(e){
        return null;
    }
}

async function getPictures(postId){
    let whereOption = {};
    pictures_arr = [];
    try{
        if(postId)whereOption.postId = postId;
        let pictures = await Picture.findAll({
            where:whereOption,
            attributes:['id', 'url', 'userId', 'postId']
        });
        if(!pictures) return null;
        pictures_arr.push(pictures[pictures.length-1].dataValues);
        // for (picture of pictures) {
        //     pictures_arr.push(picture.dataValues)
        // }
        return pictures_arr;
    }catch(e){
        console.log(e);
        return null;
    }
}

async function getPostsByTagname(tagname){
    let whereOption = {};
    posts_arr = [];
    try{
        if(tagname)whereOption.name = tagname;
        postIds_arr = []
        let tags = await Tag.findAll({
            where:whereOption,
            attributes:['postId']
        });
        if (!tags) return null;
        for (tag of tags){
            postId = tag.dataValues['postId'];
            post = await getPost(postId);
            posts_arr.push(post);
        }
        return posts_arr;
    }catch(e){
        return null;
    }
}

async function getPostsByDestination(destination){
    var whereOption = {};
    posts_arr = [];
    try{
        if (destination && destination.trim().length > 0) {
            whereOption = {destination: {[Op.like]:'%' + destination + '%'}}
        } else {
            return null;
        }
        let posts = await Post.findAll({
            where:whereOption,
            attributes:['id', 'userId', 'title', 'content', 'updatedAt', 'destination', 'startDate', 'endDate']
        });
        if (!posts) return null;
        for (post of posts){            
            let tags = await getPostTags(post.dataValues['id']);
            post.dataValues['tag'] = tags.join(', ');
            let updatedAt = getFormattedDatetime(post.dataValues['updatedAt']);
            post.dataValues['updatedAt'] = updatedAt;
            post.dataValues['startDate'] = post.dataValues['startDate'].toDateString();
            post.dataValues['endDate'] = post.dataValues['endDate'].toDateString();
            posts_arr.push(post.dataValues);
        }
        return posts_arr;
    }catch(e){
        console.log(e);
        return null;
    }
}

async function queryNewestPosts(count=3){
    try{
        let posts = await Post.findAll({
            order:[['updatedAt','desc']],
            limit:count,
            include:[{
                model:Picture,
                where:{
                    postId: Sequelize.col('post.id'),
                },
                required:false
            }]
        });
        //console.log('here')
        // console.log(posts)
        return posts
    }catch (e) {
        console.log(e.message)
        return null
    }
}

module.exports = {
    findUser,
    createUser,
    getUserPosts,
    getPost,
    createPost,
    updatePost,
    delPost,
    poComment,
    getComments,
    getPictures,
    getPostsByTagname,
    getPostsByDestination,
    queryNewestPosts,
    getPostForEdit
};