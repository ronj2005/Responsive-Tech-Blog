let blogTitle;
let blogText;
let saveblogBtn;
let newblogBtn;
let blogList;

if (window.location.pathname === '/blogpost') {
  blogTitle = document.querySelector('.blog-title');
  blogText = document.querySelector('.blog-textarea');
  saveblogBtn = document.querySelector('.save-blog');
  newblogBtn = document.querySelector('.new-blog');
  blogList = document.querySelectorAll('.list-container .list-group');
}

// Show an element
const show = (elem) => {
  elem.style.display = 'inline';
};

// Hide an element
const hide = (elem) => {
  elem.style.display = 'none';
};

// activeblog is used to keep track of the blog in the textarea
let activeblog = {};

const getblogpost = () =>
  fetch('/api/blogpost', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

const saveblog = (blog) =>
  fetch('/api/blogpost', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(blog),
  });

const deleteblog = (id) =>
  fetch(`/api/blogpost/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

const renderActiveblog = () => {
  hide(saveblogBtn);

  if (activeblog.id) {
    blogTitle.setAttribute('readonly', true);
    blogText.setAttribute('readonly', true);
    blogTitle.value = activeblog.title;
    blogText.value = activeblog.text;
  } else {
    blogTitle.removeAttribute('readonly');
    blogText.removeAttribute('readonly');
    blogTitle.value = '';
    blogText.value = '';
  }
};

const handleblogpostave = () => {
  const newblog = {
    title: blogTitle.value,
    text: blogText.value,
  };
  saveblog(newblog).join('\n').then(() => {
    getAndRenderblogpost();
    renderActiveblog();
  });
};

// Delete the clicked blog
const handleblogDelete = (e) => {
  // Prevents the click listener for the list from being called when the button inside of it is clicked
  e.stopPropagation();

  const blog = e.target;
  const blogId = JSON.parse(blog.parentElement.getAttribute('data-blog')).id;

  if (activeblog.id === blogId) {
    activeblog = {};
  }

  deleteblog(blogId).then(() => {
    getAndRenderblogpost();
    renderActiveblog();
  });
};

// Sets the activeblog and displays it
const handleblogView = (e) => {
  e.preventDefault();
  activeblog = JSON.parse(e.target.parentElement.getAttribute('data-blog'));
  renderActiveblog();
};

// Sets the activeblog to and empty object and allows the user to enter a new blog
const handleNewblogView = (e) => {
  activeblog = {};
  renderActiveblog();
};

const handleRenderSaveBtn = () => {
  if (!blogTitle.value.trim() || !blogText.value.trim()) {
    hide(saveblogBtn);
  } else {
    show(saveblogBtn);
  }
};

// Render the list of blog titles
const renderblogList = async (blogpost) => {
  let jsonblogpost = await blogpost.json();
  if (window.location.pathname === '/blogpost') {
    blogList.forEach((el) => (el.innerHTML = ''));
  }

  let blogListItems = [];

  // Returns HTML element with or without a delete button
  const createLi = (text, delBtn = true) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item');

    const spanEl = document.createElement('span');
    spanEl.classList.add('list-item-title');
    spanEl.innerText = text;
    spanEl.addEventListener('click', handleblogView);

    liEl.append(spanEl);

    if (delBtn) {
      const delBtnEl = document.createElement('i');
      delBtnEl.classList.add(
        'fas',
        'fa-trash-alt',
        'float-right',
        'text-danger',
        'delete-blog'
      );
      delBtnEl.addEventListener('click', handleblogDelete);

      liEl.append(delBtnEl);
    }

    return liEl;
  };

  if (jsonblogpost.length === 0) {
    blogListItems.push(createLi('No saved blogpost', false));
  }

  jsonblogpost.forEach((blog) => {
    const li = createLi(blog.title);
    li.dataset.blog = JSON.stringify(blog);

    blogListItems.push(li);
  });

  if (window.location.pathname === '/blogpost') {
    blogListItems.forEach((blog) => blogList[0].append(blog));
  }
};

// Gets blogpost from the db and renders them to the sidebar
const getAndRenderblogpost = () => getblogpost().then(renderblogList);

if (window.location.pathname === '/blogpost') {
  saveblogBtn.addEventListener('click', handleblogpostave);
  newblogBtn.addEventListener('click', handleNewblogView);
  blogTitle.addEventListener('keyup', handleRenderSaveBtn);
  blogText.addEventListener('keyup', handleRenderSaveBtn);
}

getAndRenderblogpost();