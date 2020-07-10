class View { // класс отвечающий за отображение элементов на странице
    constructor() {
        this.app = document.getElementById('app');

        this.title = this.createElement('h1', 'title');
        this.title.textContent = 'Github Search Repo';
        

        this.searchLine = this.createElement('div', 'search-line');
        this.searchInput = this.createElement('input', 'search-input');
        this.searchLine.append(this.searchInput);

        this.reposWrapper = this.createElement('div', 'repos-wrapper');
        this.reposList = this.createElement('ul', 'repos');
        this.reposWrapper.append(this.reposList);
        
        this.app.append(this.title);
        this.app.append(this.searchLine);
        this.app.append(this.reposWrapper);


        this.paginator = this.createElement('div', 'paginator');
        this.reposWrapper.append(this.paginator);

        
    }

    createElement(elementTag, elementClass, item) { //метод создания элементов с присвоением классов (при необходимости)
        const element = document.createElement(elementTag);
        if(elementClass) {
            element.classList.add(elementClass);
        };
        if(item) {
            element.innerHTML = `${item}`;
        };
        return element;
    }
    createRepo(repoData) {
        const repoElement = this.createElement('li', 'repo');
        repoElement.addEventListener('click', () => {
            localStorage.setItem('array', JSON.stringify(repoData));
            window.location.href = 'repo.html';
            /* document.getElementsByClassName('text').innerHTML = repoData.name */
        }
        );
        repoElement.innerHTML = `
            <span class='repo-name'>Name: [${repoData.name}]</span>
            <span class='repo-stars'>Stars: [${repoData.stargazers_count}]</span>
            <span class='repo-commit-date'>Last commit: [${repoData.pushed_at}]</span>
            <span class='repo-url'>url:[${repoData.url}]</span>
        `;
        this.reposList.append(repoElement);
    }
    createPages(repoInfo){
        let pageCount = repoInfo.total_count / REPO_PER_PAGE;
        console.log(pageCount);

        if (pageCount > 10) {
            pageCount = 10;
        }
        for (let i = 0; i < pageCount; i++) {
            const pageItem = this.createElement('span', 'page', `${i + 1}`);
            this.paginator.append(pageItem);
        };
        let active = document.querySelector('.page');
        if (active) { // защита от отсутствия результата запроса
            active.classList.add('active');
        }  
    }
    
}
const REPO_PER_PAGE = 10;

class Search {  // класс логики поиска репозиториев
    constructor(view) {
        this.view = view;

        this.view.searchInput.addEventListener('keyup', this.debounce(this.loadRepo.bind(this), 500));

        this.currentPage = 1;

        document.onreadystatechange = this.getLocalStorage();
        
    }

    setCurrentPage (pageNumber) {
        console.log(pageNumber);
        this.currentPage = pageNumber;
    }
     
    async loadRepo(e) {
       
        if (e && e.target.classList.contains('page')) { // измененние класса активности выбраной страницы пагинатора
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active')); 
            e.target.classList.add('active');
            this.setCurrentPage(+e.target.textContent);
        };
        if (this.view.reposList.hasChildNodes()) { // изменение вида страницы поиска репозиториев
            this.view.reposList.innerHTML = '';
        };
        
        if(this.view.searchInput.value) {
            return await fetch(`https://api.github.com/search/repositories?q=${this.view.searchInput.value}&sort=stars&per_page=${REPO_PER_PAGE}&page=${this.currentPage}`).then((res) => {
                if (res.ok) {       
                    res.json().then(res => {
                        res.items.forEach(repo => {
                            this.view.createRepo(repo); 
                        });
                        if (!this.view.paginator.hasChildNodes()) { // создание страниц пагинатора и выбор страницы
                            this.view.createPages(res);
                            this.pageSelection();    
                        };
                        this.setLocalStorage(this.view.searchInput.value);                       
                    });
                }
            });
        } else {
            this.clearRepos();
        };
        
    }
    pageSelection () {
        let pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.addEventListener('click', this.loadRepo.bind(this));
        });
    }
    clearRepos() {// замена поиска репозиториев на 'топ 10' при очищении инпута
        this.view.searchInput.value = ''; // установка параметров не из localStorage
        this.currentPage = 1;
        localStorage.clear();
        this.view.searchInput.value = 'stars%3A>0';
        this.loadRepo();
        this.view.searchInput.value = '';
    }
    debounce(func, wait, immediate) { // позволяет не сработать keyup пока он вызывается повторно в течении wait
        var timeout;
        return function() {
            let context = this, args = arguments;
            let later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            let callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
    setLocalStorage(value) {// сохранение выбраных фильтров
        let pages = document.querySelectorAll('.page');

        if (!localStorage.getItem('button')) {
            localStorage.setItem('button', `${1}`); // сохранение при пустой странице
            localStorage.setItem('input', `${value}`);
        }
        for (let i = 0; i < pages.length; i++) {// сохранение при изменении пагинатора
            pages[i].onclick = function() {
                localStorage.setItem('button', `${i + 1}`);
                console.log(value);
            };
        };
        this.view.searchInput.onchange = function() { // сохранение при изменении инпута(при изменении фокуса)
            console.log(value);
            localStorage.setItem('input', `${this.value}`);
        };
    }
    getLocalStorage() {
        if (localStorage.getItem('input')) {// при первой загрузке не прогрузится
            this.view.searchInput.value = localStorage.getItem('input');
            console.log(this.view.searchInput.value)
            if (this.currentPage !== localStorage.getItem('button')){
                this.currentPage = localStorage.getItem('button'); 
                console.log(this.currentPage);
            };          
        this.loadRepo();
        }
    }
};


new Search(new View());