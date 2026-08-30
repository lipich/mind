// phrases dataset
var ds_phrases = [];
// phrases filtered dataset 
var ds_phrases_f = [];
// topic list
var ds_topics = [];
// authtor list
var ds_authors = [];

// load page
$(document).ready(function() {
  loadData();
  localStorage.setItem('filterTopic', 'Все');
  localStorage.setItem('filterAuthor', 'Все');
});

// Load initial data from file 
function loadData() {
  $.getJSON('server/get_phrases.php',
  function(data) {
    if (!data.res) {
      $.each(data.data, function(index, item) {
        if (item)
          ds_phrases.push(item);
          ds_phrases_f.push(item);
      }); 

      getFilterTopics(ds_phrases);
      getFilterAuthors(ds_phrases);
      
      showTopics();
      showAuthors();

      showData();
    } else {
      bootbox.alert(data.res);
    }
  });
}

// Show data on page
function showData() {
  const tbody = document.getElementById('data_body');

  $('#counter_selected_rows').text("");
  $('#loading_count').show();
  $('#loading_count_all').show();

  // Собираем все строки в DocumentFragment и вставляем одним махом —
  // это намного быстрее, чем appendTo() на каждой итерации при 2000+ строк
  const fragment = document.createDocumentFragment();

  for (const item of ds_phrases_f) {
    const tr = document.createElement('tr');
    for (const value of item) {
      const td = document.createElement('td');
      td.textContent = value; // textContent сам экранирует значение, XSS исключён
      tr.appendChild(td);
    }
    fragment.appendChild(tr);
  }

  tbody.innerHTML = '';
  tbody.appendChild(fragment);

  $('#loading_count').hide();
  $('#counter_selected_rows').text(ds_phrases_f.length.toLocaleString());
  $('#loading_count_all').hide();
  $('#counter_all_rows').text(ds_phrases.length.toLocaleString());
}

// Filter topics
function filterTopics(filter) {
  $('#ddFilterTopic').text(filter);
  localStorage.setItem('filterTopic', filter);
  ds_phrases_f = [];
  const filterAuthor = localStorage.getItem('filterAuthor');	
  const filterTopic = localStorage.getItem('filterTopic');	

  for (const item of ds_phrases) {
    if ((filterTopic == item[0] || filterTopic == 'Все') && (filterAuthor == item[1] || filterAuthor == 'Все'))  
      ds_phrases_f.push(item);
  }

  if (filterTopic == 'Все') {
    getFilterTopics(ds_phrases_f);
    showTopics();
  }

  getFilterAuthors(ds_phrases_f);
  showAuthors();

  showData();
}

// Filter authors
function filterAuthors(filter) {
  $('#ddFilterAuthor').text(filter);
  localStorage.setItem('filterAuthor', filter);
  ds_phrases_f = [];
  const filterAuthor = localStorage.getItem('filterAuthor');	
  const filterTopic = localStorage.getItem('filterTopic');	

  for (const item of ds_phrases) {
    if ((filterTopic == item[0] || filterTopic == 'Все') && (filterAuthor == item[1] || filterAuthor == 'Все'))  
      ds_phrases_f.push(item);
  }

  if (filterAuthor == 'Все') {
    getFilterAuthors(ds_phrases_f);
    showAuthors();
  }

  getFilterTopics(ds_phrases_f);
  showTopics();  

  showData();
}

// Get filters of topics from dataset
function getFilterTopics(data) {
  const filterAuthor = localStorage.getItem('filterAuthor');	
  const ds_topic = [];

  for (const item of data) {
    if (item[1] == filterAuthor || filterAuthor == 'Все')
      ds_topic.push(item[0]);
  }  

  ds_topics = [...new Set(ds_topic)].sort();
  ds_topics.unshift('Все');
}

// Get filters of authors from dataset
function getFilterAuthors(data) {
  const filterTopic = localStorage.getItem('filterTopic');	
  const ds_author = [];

  for (const item of data) {
    if (item[0] == filterTopic || filterTopic == 'Все')
      ds_author.push(item[1]);
  }  

  ds_authors = [...new Set(ds_author)].sort();
  ds_authors.unshift('Все');
}

// Show topics filter
function showTopics() {
  const list = document.getElementById('lstTopicData');
  list.innerHTML = '';

  for (const topic of ds_topics) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#';
    a.className = 'dropdown-item';
    a.dataset.pdsaDropdownVal = topic;
    a.textContent = topic; // textContent исключает XSS и поломку разметки спецсимволами
    a.addEventListener('click', (e) => { e.preventDefault(); filterTopics(topic); });
    li.appendChild(a);
    list.appendChild(li);
  }
}

// Show authors filter
function showAuthors() {
  const list = document.getElementById('lstAuthorData');
  list.innerHTML = '';

  for (const author of ds_authors) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#';
    a.className = 'dropdown-item';
    a.dataset.pdsaDropdownVal = author;
    a.textContent = author;
    a.addEventListener('click', (e) => { e.preventDefault(); filterAuthors(author); });
    li.appendChild(a);
    list.appendChild(li);
  }
}