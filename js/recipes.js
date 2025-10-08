document.addEventListener('DOMContentLoaded', function () {
  const userData = JSON.parse(localStorage.getItem('loggedUser'));
  const container = document.getElementById('recipes-container');
  const searchInput = document.getElementById('search-input');
  const cuisineFilter = document.getElementById('cuisine-filter');
  const showMoreBtn = document.getElementById('show-more-btn');
  const modal = document.getElementById('recipe-modal');
  const logoutBtn = document.getElementById('logout-btn');
  const countInfo = document.getElementById('count-info');

  if (!userData) {
    window.location.href = 'index.html';
    return;
  }

  var welcomeEl = document.getElementById('welcome-message');
  if (welcomeEl) welcomeEl.textContent = 'Welcome, ' + userData.firstName + '!';

  logoutBtn.addEventListener('click', function () {
    localStorage.removeItem('loggedUser');
    window.location.href = 'index.html';
  });

  let recipes = [];
  let displayed = 0;
  const perPage = 6;

  async function loadRecipes() {
    try {
      container.innerHTML = '<p>Loading recipes...</p>';
      const res = await fetch('https://dummyjson.com/recipes');
      const data = await res.json();
      recipes = data.recipes || [];

      // Fill cuisines
      const cuisines = Array.from(new Set(recipes.map(function (r) { return r.cuisine; })));
      cuisines.forEach(function (c) {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        cuisineFilter.appendChild(opt);
      });

      displayed = perPage;
      renderRecipes();
    } catch (err) {
      container.innerHTML = '<p style="color:red;">Failed to load recipes: ' + err.message + '</p>';
    }
  }

  function getFiltered() {
    const q = (searchInput.value || '').toLowerCase();
    const cf = cuisineFilter.value;
    return recipes.filter(function (r) {
      const matchSearch =
        r.name.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.ingredients.join(' ').toLowerCase().includes(q) ||
        r.tags.join(' ').toLowerCase().includes(q);
      const matchCuisine = cf ? r.cuisine === cf : true;
      return matchSearch && matchCuisine;
    });
  }

  function renderRecipes() {
    const filtered = getFiltered();
    container.innerHTML = '';

    const countToShow = Math.min(displayed, filtered.length);
    filtered.slice(0, countToShow).forEach(createRecipeCard);

    // Show More visibility
    showMoreBtn.style.display = filtered.length > countToShow ? 'block' : 'none';

    updateCount(countToShow, recipes.length);
  }

  function updateCount(showing, total) {
    if (!countInfo) return;
    countInfo.textContent = 'Showing ' + showing + ' of ' + total + ' recipes';
  }

  function createRecipeCard(r) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.innerHTML =
      '<img src="' + r.image + '" alt="' + r.name + '">' +
      '<h3>' + r.name + '</h3>' +
      '<p>Time: ' + r.cookTimeMinutes + ' mins</p>' +
      '<p>Rating: ' + r.rating + ' | ' + r.cuisine + '</p>' +
      '<button class="view-btn" data-id="' + r.id + '">View Full Recipe</button>';
    container.appendChild(card);
  }

  container.addEventListener('click', async function (e) {
    if (e.target.classList.contains('view-btn')) {
      const id = e.target.getAttribute('data-id');
      const res = await fetch('https://dummyjson.com/recipes/' + id);
      const recipe = await res.json();

      document.getElementById('modal-title').textContent = recipe.name;
      document.getElementById('modal-image').src = recipe.image;
      document.querySelector('.modal-header-details').textContent =
        'Time: ' + (recipe.prepTimeMinutes + recipe.cookTimeMinutes) +
        ' mins | Rating: ' + recipe.rating + ' | ' + recipe.cuisine;

      const ingList = document.getElementById('modal-ingredients-list');
      ingList.innerHTML = recipe.ingredients.map(function (i) {
        return '<li>' + i + '</li>';
      }).join('');

      const instrList = document.getElementById('modal-instructions-list');
      instrList.innerHTML = recipe.instructions.map(function (i) {
        return '<li>' + i + '</li>';
      }).join('');

      const markBtn = document.getElementById('mark-recooked-btn');
      markBtn.setAttribute('data-recipe-id', recipe.id);
      markBtn.setAttribute('data-recipe-name', recipe.name);

      modal.style.display = 'flex';
    }
  });

  // Close modal
  document.querySelector('.close-btn').addEventListener('click', function () {
    modal.style.display = 'none';
  });

  // Mark as Re-cooked
  document.getElementById('mark-recooked-btn').addEventListener('click', function (e) {
    const recooked = JSON.parse(localStorage.getItem('recookedRecipes')) || [];
    recooked.push({
      id: e.target.getAttribute('data-recipe-id'),
      name: e.target.getAttribute('data-recipe-name'),
      date: new Date().toISOString()
    });
    localStorage.setItem('recookedRecipes', JSON.stringify(recooked));
    alert('Marked as re-cooked!');
  });

  // Search with debounce
  let debounceTimer;
  searchInput.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      displayed = perPage;
      renderRecipes();
    }, 400);
  });

  cuisineFilter.addEventListener('change', function () {
    displayed = perPage;
    renderRecipes();
  });

  showMoreBtn.addEventListener('click', function () {
    displayed += perPage;
    renderRecipes();
  });

  loadRecipes();
});