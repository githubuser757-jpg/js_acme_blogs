const createElemWithText = (htmlElement = "p", textContent = "", className) =>{
    const element = document.createElement(htmlElement);
    if(textContent != "") element.textContent = textContent;
    if(className != null) element.className = className;
    return element;
}

const createSelectOptions = (jsonData) =>{
    if(jsonData === undefined) return undefined;

    const optionsArray = jsonData.map(user =>{
        const element = document.createElement("option");
        element.value = user.id;
        element.textContent = user.name;
        return element;
    });

    return optionsArray;
}

const toggleCommentSection = (postId) =>{
    if(postId === undefined) return undefined;

    let sectionElement = document.querySelector(`section[data-post-id="${postId}"]`);

    if(sectionElement != null){
        const classes = sectionElement.classList;
        classes.toggle('hide');
    }
    else{
        return null;
    }

    return sectionElement;
}

const toggleCommentButton = (postId) =>{
    if(postId === undefined) return undefined;

    const button = document.querySelector(`button[data-post-id="${postId}"]`);

    if(button != null){
        button.textContent === "Show Comments" ? button.textContent = "Hide Comments" : button.textContent = "Show Comments";
    }
    else{
        return null;
    }

    return button;
}

const deleteChildElements = (parentElement) =>{
    if(parentElement === undefined) return undefined;
    if(!(parentElement instanceof HTMLElement)) return undefined;

    let lastChild = parentElement.lastChild;
    while(lastChild != null){
        parentElement.removeChild(lastChild);
        lastChild = parentElement.lastChild;
    }

    return parentElement;
}

const addButtonListeners = () =>{
    const selectedButtons = [];

    const main = document.querySelector('main');
    const buttons = main.querySelectorAll('button');

    for(const button of buttons){
        const postId = button.dataset.postId;
        if(postId != undefined){
            button.addEventListener("click", (event) =>{
                toggleComments(event, postId);
            });
        }

        selectedButtons.push(button);
    }

    return selectedButtons;
}

const removeButtonListeners = () =>{
    const buttons = Array.from(document.querySelectorAll('main button'));
    if(buttons.length === 0) return [];

    const selectedButtons = [];

    buttons.forEach(button => {
        const postId = button.dataset.postId;
        if(postId){
            button.removeEventListener('click', toggleComments);
            selectedButtons.push(button);
        }
    });

    return selectedButtons;
}

const toggleComments = (e, postId) =>{
    if(!postId) return undefined;

    e.target.listener = true;
    const section = toggleCommentSection(postId);
    const button = toggleCommentButton(postId);
    const elementArray = [section, button];
    return elementArray;
}

const createComments = (jsonCommentData) =>{
    if(!jsonCommentData) return undefined;

    const fragment = document.createDocumentFragment();

    const commentsArray = Array.from(jsonCommentData);
    commentsArray.forEach(comment =>{
        const article = document.createElement("article");
        const h3Element = createElemWithText('h3', comment.name);
        const paragraph = createElemWithText('p', comment.body);
        const paragraph2 = createElemWithText('p', `From: ${comment.email}`);
        article.appendChild(h3Element);
        article.appendChild(paragraph);
        article.appendChild(paragraph2);
        fragment.appendChild(article);
    });

    return fragment;
}

const populateSelectMenu = (JSONUserData) =>{
    if(!JSONUserData) return undefined;
    const selectMenu = document.querySelector('#selectMenu');
    const optionsArray = createSelectOptions(JSONUserData);
    optionsArray.forEach(option =>{
        selectMenu.appendChild(option);
    });
    return selectMenu;
}

const getUsers = async() =>{
    try{
        const response = await fetch("https://jsonplaceholder.typicode.com/users");
        if(!response.ok){
            return null;
        }
        const data = await response.json();
        return data;
    }
    catch(error)
    {
        return null;
    }
}

const getUserPosts = async(userId) =>{
    if(!userId) return undefined;
    try{
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
        const data = await response.json();
        return data;
    }
    catch(error)
    {
        return null;
    }
}

const getUser = async(userId) =>{
    if(!userId) return undefined;
    try{
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
        const data = await response.json();
        return data;
    }
    catch(error)
    {
        return null;
    }
}

const getPostComments = async(postId) =>{
    if(!postId) return undefined;
    try{
        const response = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`);
        const data = await response.json();
        return data;
    }
    catch(error)
    {
        return null;
    }
}

const displayComments = async(postId) =>{
    if(!postId) return undefined;
    const section = document.createElement("section");
    section.dataset.postId = postId;
    section.classList.add('comments');
    section.classList.add('hide');

    const comments = await getPostComments(postId);
    const fragment = createComments(comments);
    section.appendChild(fragment);
    return section;
}

const createPosts = async(JSONPostsData) =>{
    if(!JSONPostsData) return undefined;
    const fragment = document.createDocumentFragment();
    const postsArray = Array.from(JSONPostsData);
    for(const post of postsArray){
        const article = document.createElement("article");
        const h2Element = createElemWithText('h2', post.title);
        const pElement = createElemWithText('p', post.body);
        const pElement2 = createElemWithText('p', `Post ID: ${post.id}`);
        const author = await getUser(post.userId);
        const pElement3 = createElemWithText('p', `Author: ${author.name} with ${author.company.name}`);
        const pElement4 = createElemWithText('p', author.company.catchPhrase);
        const button = document.createElement('button');
        button.textContent = "Show Comments";
        button.dataset.postId = post.id;
        const section = await displayComments(post.id);
        article.appendChild(h2Element);
        article.appendChild(pElement);
        article.appendChild(pElement2);
        article.appendChild(pElement3);
        article.appendChild(pElement4);
        article.appendChild(button);
        article.appendChild(section);

        fragment.appendChild(article);
    };

    return fragment;
}

const displayPosts = async(postData) =>{
    const main = document.querySelector('main');

    const element = (postData != undefined) ? await createPosts(postData) : (() => {
        let p = document.createElement('p');
        p = document.querySelector('p.default-text').cloneNode(true);
        return p;
    })();

    main.appendChild(element);
    return element;
}

const initPage = async() =>{
    const userJSONData = await getUsers();
    const selectElement = populateSelectMenu(userJSONData);
    return [userJSONData, selectElement];
}

const refreshPosts = async(postsJSONData) =>{
    if(postsJSONData === undefined) return undefined;

    const removeButtons = removeButtonListeners();
    const main = deleteChildElements(document.querySelector('main'));
    const fragment = displayPosts(postsJSONData);
    const addButtons = addButtonListeners();

    return [removeButtons, main, fragment, addButtons];
}

const selectMenuChangeEventHandler = async(event) =>{
    if(!event) return;
    if(event.type != "change") return;

    const userId = event?.target?.value === "Employees" ? event.target.value : 1;

    const selectMenu = event.target;

    if(selectMenu) selectMenu.disabled = true;

    const posts = await getUserPosts(userId);
    const refreshPostsArray = await refreshPosts(posts);

    if(selectMenu) selectMenu.disabled = false;

    return [userId, posts, refreshPostsArray];
}

const initApp = () =>{
    initPage();
    const selectMenu = document.querySelector('#selectMenu');
    selectMenu.addEventListener('change', (event) =>{
        selectMenuChangeEventHandler(event);
    });
}

document.addEventListener('DOMContentLoaded', initApp);