const { 
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
} = require('../service/api');
const { SuccessResponse, FailureResponse } = require('./responseModel');


async function getUser(email, password){ //
    let user = await findUser(email, password);
    if(user){
        return new SuccessResponse(user)
    }else{
        return new FailureResponse(403,'No matched user found')
    }
}

async function registerUser(username,password,email){
    let result = await createUser(username, password, email);
    if(result){
        let ret = result.dataValues;
        // console.log(ret);
        return new SuccessResponse()
    }else{
        return new FailureResponse(1001,'failed registration')
    }
}

async function retrieveUserPosts(userid) {
    let posts = await getUserPosts(userid);
    if (posts) {
        return new SuccessResponse(posts);
    } else {
        return new FailureResponse(403, 'No matched posts found')
    }
}

async function retrievePost(postId){
    let post = await getPost(postId);
    if (post) {
        return new SuccessResponse(post);
    } else {
        return new FailureResponse(403, 'No matched posts found')
    }
}

async function retrievePost_forEdit(postId){
    let post = await getPostForEdit(postId);
    if (post) {
        return new SuccessResponse(post);
    } else {
        return new FailureResponse(403, 'No matched posts found')
    }
}

async function new_idea(user_id, title, destination, start_date, end_date, content, tags, image){
    let result = await createPost(user_id, title, destination, start_date, end_date, content, tags, image);
    if(result) {
        return new SuccessResponse();
    } else {
        return new FailureResponse(500, 'Error occurred');
    }
}

async function update_idea(post_id, user_id, title, destination, start_date, end_date, content, image){
    let result = await updatePost(post_id, user_id, title, destination, start_date, end_date, content, image);
    if(result) {
        return new SuccessResponse();
    } else {
        return new FailureResponse(500, 'Error occurred');
    }
}

async function deletePost(postId){
    let result = await delPost(postId);
    if (result) {
        return new SuccessResponse();
    } else {
        return new FailureResponse(1002, 'failed delete post');
    }
}

async function postComment(postId, userId, content) {
    let result = await poComment(postId, userId, content);
    if (result) {
        return new SuccessResponse();
    } else {
        return new FailureResponse(1003, 'failed post comment');
    }
}

async function retrieveComments(postId) {
    let comments = await getComments(postId);
    if (comments) {
        return new SuccessResponse(comments);
    } else {
        return new FailureResponse(1004, 'failed retrieve comments');
    }
}

async function retrievePostPictures(postId){
    let pictures = await getPictures(postId);
    if (pictures){
        return new SuccessResponse(pictures);
    } else {
        return new FailureResponse(1005, 'failed retrieve post pictures');
    }
}

async function retrievePostsByTagname(tagname){
    let posts = await getPostsByTagname(tagname);
    if (posts) {
        return new SuccessResponse(posts);
    } else {
        return new FailureResponse(1006, 'failed retrieve posts by tag name');
    }
}

async function retrievePostsByDestination(destination){
    let posts = await getPostsByDestination(destination);
    if (posts) {
        return new SuccessResponse(posts);
    } else {
        return new FailureResponse(1007, 'failed retrieve posts by destination');
    }
}


// async function getApi(url) {
//     var request = require('request');
//     await request(url, function (error, response, body) {
//         if (!error && response.statusCode == 200) {
//             return body;
//          }
//     })
// }

async function getApi(url){
    try{
        var rp = require ('request-promise-native');
        var options = {
        uri:url,
        json:true,
    };
    var response = await rp(options);
    return response;
    }catch(e){
        console.log(e.message)
        return new FailureResponse(999, 'failed get data from restful api')
    }        
}

// get three for home page recommendations
async function getLatestPosts(){
    let result = await queryNewestPosts();
    if(result){
        let ret = result.map(v=>{
            let post = v.dataValues
            post.pictures = post.pictures.map(pic=>{
                pic.url = pic.url.slice(7);
                return pic
            });
            return post
        });
        return new SuccessResponse(ret)
    }else{
        return new FailureResponse(1011,'no recommendations found')
    }
}


module.exports = {
    getUser,
    registerUser,
    retrieveUserPosts,
    retrievePost,
    new_idea,
    update_idea,
    deletePost,
    postComment,
    retrieveComments,
    retrievePostPictures,
    retrievePostsByTagname,
    retrievePostsByDestination,
    getApi,
    getLatestPosts,
    retrievePost_forEdit
};
