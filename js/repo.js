array = JSON.parse(localStorage.getItem("array"));

if (!array.description) {
    array.description = 'This person did not provide a description'
}


document.querySelector('.repo-data').innerHTML = `
    <div class="name">Repo name: ${array.name}</div>
    <div class="stars">Stars: ${array.stargazers_count}</div>
    <div class="commit">Last commit at: ${array.pushed_at}</div>
`;
document.querySelector('.repo-photo').innerHTML = `
    <div>Photo: </div>
    <img class="photo" src="${array.owner.avatar_url}" alt="${array.owner.login}"></img>
    <a href="${array.owner.html_url}" class="login">Login: ${array.owner.login}</a>
`;
document.querySelector('.repo-lang').innerHTML = `
    <div class="lang">Language: ${array.language}</div>
`;
document.querySelector('.repo-descr').innerHTML = `
    <div class="descr">Description: '${array.description}'</div>
`;
document.querySelector('.repo-contreb').innerHTML = `
    <div class="contrebutors">Contrebutors: </div>   
`;



fetch(`${array.contributors_url}`).then((res) => {   
    console.log(res) 
    res.json().then(res => {
        if (res.length > 10) {
            res.length = 10;
        };
        res.forEach(contreb => {
            document.querySelector('.contrebutors').innerHTML += `<a class="contreb" href="${contreb.html_url}">[${contreb.login}]</a> `;
        });               
    });

});