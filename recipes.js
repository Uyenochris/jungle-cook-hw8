
const $ = selector => document.querySelector(selector);
const page = document.body.dataset.page;
let cachedRecipes;

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function imageURL(src) {
  if (typeof src === 'string' && (src.startsWith('assets/') || src.startsWith('data:image/'))) return src;
  return 'assets/recipe-pizza.jpg';
}
function recipeURL(recipe) { return `recipe.html?id=${encodeURIComponent(recipe.id)}`; }
function say(message, type) { window.showNotice?.(message, type); }
async function loadRecipes() {
  if (cachedRecipes) return cachedRecipes;
  say('Loading recipes...');
  try {
    const response = await fetch('data/recipes.json');
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const recipes = await response.json();
    if (!Array.isArray(recipes)) throw new Error('Incorrect JSON format');
    cachedRecipes = recipes;
    return recipes;
  } catch (error) {
    say('Could not load recipes. Please refresh or check that data/recipes.json was uploaded.', 'error');
    console.error('Loading JSON:', error);
    return [];
  }
}
function userKey(uid) { return 'jungle-cook-hw8-recipes-' + uid; }
async function getMyRecipes(uid) {
  const key = userKey(uid);
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
      throw new Error('Incorrect saved data');
    }
    // Give new accounts one sample recipe from the JSON file, like in the prototype.
    const demo = (await loadRecipes()).find(item => item.id === 'supreme-pizza');
    const starting = demo ? [{ ...demo, id: 'sample-' + uid, isUserRecipe: true }] : [];
    localStorage.setItem(key, JSON.stringify(starting));
    return starting;
  } catch (error) {
    say('Could not read saved recipes on this browser. Check browser storage settings.', 'error');
    console.error('Reading recipes:', error);
    return [];
  }
}
function saveMyRecipes(uid, recipes) {
  try {
    localStorage.setItem(userKey(uid), JSON.stringify(recipes));
    return true;
  } catch (error) {
    say('Could not save recipe. Browser storage may be full. Try a smaller image.', 'error');
    console.error('Saving recipes:', error);
    return false;
  }
}
function cardHTML(recipe, mine = false) {
  const title = escapeHTML(recipe.title);
  const url = recipeURL(recipe);
  return `<article class="${mine ? 'my-card-wrap' : ''}">
    <div class="recipe-card">
      <div class="recipe-card-picture">
        <a href="${url}" aria-label="View ${title}"><img src="${imageURL(recipe.image)}" alt="${title}"></a>
        ${mine ? `<a class="yellow-button view-overlay" href="${url}">View</a>` : ''}
      </div>
      <div class="recipe-card-content">
        <h2><a href="${url}">${title}</a></h2>
        <p>${escapeHTML(recipe.description)}</p>
        <div class="card-stat"><img src="assets/time.svg" alt="Time"><span>${escapeHTML(recipe.time)}</span></div>
        <div class="card-stat"><img src="assets/servings.svg" alt="Servings"><span>${escapeHTML(recipe.servings)}</span></div>
      </div>
    </div>
    ${mine ? `<div class="card-actions"><a class="yellow-button" href="edit.html?id=${encodeURIComponent(recipe.id)}">Edit Recipe</a><button type="button" class="yellow-button delete-recipe" data-id="${escapeHTML(recipe.id)}">Delete</button></div>` : ''}
  </article>`;
}
function getId() { return new URLSearchParams(location.search).get('id'); }
function needLogin(target) {
  target.innerHTML = `<div class="empty-state"><h2>Please log in first.</h2><p>You need to log in to view or create your own recipes.</p><a class="yellow-button inline-button" href="login.html">Go to Login</a></div>`;
}
async function drawBrowse() {
  const target = $('#browse-recipes');
  const recipes = await loadRecipes();
  target.innerHTML = recipes.length ? recipes.map(recipe => cardHTML(recipe)).join('') : '<p>No recipes available.</p>';
}
async function drawMine(user) {
  const target = $('#your-recipes');
  if (!user) { needLogin(target); return; }
  $('#your-heading').textContent = `Hey ${user.displayName?.split(' ')[0] || 'Chef'}, here are your recipes!`;
  const recipes = await getMyRecipes(user.uid);
  target.innerHTML = recipes.length ? `<div class="your-list">${recipes.map(r => cardHTML(r, true)).join('')}</div>` : '<div class="empty-state"><p>You have no recipes right now. Try creating one!</p><a class="yellow-button inline-button" href="create.html">Create Recipe</a></div>';
  for (const button of target.querySelectorAll('.delete-recipe')) {
    button.addEventListener('click', async () => {
      const id = button.dataset.id;
      if (!confirm('Delete this recipe? This cannot be undone.')) return;
      const saved = await getMyRecipes(user.uid);
      if (saveMyRecipes(user.uid, saved.filter(r => r.id !== id))) {
        say('Recipe deleted.', 'success');
        drawMine(user);
      }
    });
  }
}
async function findRecipe(id, user) {
  const local = await loadRecipes();
  if (!id) return null;
  if (user) {
    const mine = await getMyRecipes(user.uid);
    const owned = mine.find(r => r.id === id);
    if (owned) return { recipe: owned, owned: true };
  }
  const publicRecipe = local.find(r => r.id === id);
  return publicRecipe ? { recipe: publicRecipe, owned: false } : null;
}
async function drawDetail(user) {
  const target = $('#recipe-detail');
  const result = await findRecipe(getId(), user);
  if (!result) { target.innerHTML = '<h1>Recipe not found</h1><p><a href="browse.html">Go back to Browse</a></p>'; say('Recipe not found.', 'error'); return; }
  const {recipe:r,owned} = result;
  const ingredients = Array.isArray(r.ingredients) ? r.ingredients : [];
  const instructions = Array.isArray(r.instructions) ? r.instructions : [];
  target.innerHTML = `
    <div class="detail-top">
      <div class="detail-image-wrap"><img src="${imageURL(r.image)}" alt="${escapeHTML(r.title)}"><span class="vertical-name">${escapeHTML(r.title.toLowerCase())}</span></div>
      <div><h2>Description:</h2><p>${escapeHTML(r.description)}</p><h2>Total Time:</h2><p>${escapeHTML(r.time)}</p><h2>Servings:</h2><p>${escapeHTML(r.servings)}</p></div>
    </div>
    <section class="detail-section"><h2>Ingredients:</h2><ul>${ingredients.map(x => `<li>${escapeHTML(x)}</li>`).join('')}</ul></section>
    <section class="detail-section"><h2>Instructions:</h2><ol>${instructions.map(x => `<li>${escapeHTML(x)}</li>`).join('')}</ol></section>
    ${owned ? `<div class="detail-actions"><a class="yellow-button" href="edit.html?id=${encodeURIComponent(r.id)}">Edit Recipe</a></div>` : ''}`;
}
function addInput(container, kind, value = '') {
  const number = container.querySelectorAll('input').length + 1;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'line-field';
  input.placeholder = (kind === 'ingredient' ? 'Ingredient #' : 'Instruction #') + number;
  input.setAttribute('aria-label', input.placeholder);
  input.value = value;
  input.maxLength = 250;
  container.appendChild(input);
}
function populateLines(values, container, kind) {
  container.replaceChildren();
  const arr = Array.isArray(values) ? values : [];
  for (let i=0;i<Math.max(3, arr.length);i++) addInput(container, kind, arr[i] || '');
}
function getLines(container) { return Array.from(container.querySelectorAll('input')).map(x => x.value.trim()).filter(Boolean); }
function imageToSmallDataURL(file) {
  return new Promise((resolve,reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Please choose an image file.'));
    if (file.size > 10 * 1024 * 1024) return reject(new Error('Choose an image smaller than 10 MB.'));
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, 900 / Math.max(img.width,img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Could not process this image.'));
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      resolve(canvas.toDataURL('image/jpeg',.7));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read this picture.')); };
    img.src = url;
  });
}
async function setupEditor(user, editing) {
  const form = $('#recipe-form');
  if (!user) { form.innerHTML = ''; needLogin(form); return; }
  $('#editor-heading').textContent = `Hey ${user.displayName?.split(' ')[0] || 'Chef'}, ${editing ? 'edit your recipe!' : 'create your recipe!'}`;
  $('#image-label').textContent = editing ? 'Edit Recipe Image' : 'Add Recipe Image';
  $('#submit-recipe').textContent = editing ? 'Submit Changes' : 'Create Recipe';
  const ingredients = $('#ingredients-fields'); const instructions = $('#instructions-fields');
  let original = null;
  if (editing) {
    const mine = await getMyRecipes(user.uid);
    original = mine.find(r => r.id === getId());
    if (!original) { form.innerHTML = '<p>Recipe not found. <a href="your-recipes.html">Back to Your Recipes</a></p>'; say('You can only edit your own recipes.', 'error'); return; }
    $('#recipe-name').value = original.title;
    $('#recipe-desc').value = original.description;
    $('#recipe-time').value = original.time;
    $('#recipe-servings').value = original.servings;
  }
  populateLines(original?.ingredients, ingredients, 'ingredient');
  populateLines(original?.instructions, instructions, 'instruction');
  for (const button of form.querySelectorAll('.add-field')) {
    button.addEventListener('click', () => addInput(button.dataset.add === 'ingredient' ? ingredients : instructions, button.dataset.add));
  }
  let image = original?.image || 'assets/recipe-pizza.jpg';
  $('#recipe-image').addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      say('Processing image...');
      image = await imageToSmallDataURL(file);
      $('#file-name').textContent = file.name;
      say('Picture attached.', 'success');
    } catch(error) { say(error.message,'error'); event.target.value = ''; }
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = $('#submit-recipe');
    const title = $('#recipe-name').value.trim(), description = $('#recipe-desc').value.trim();
    const time = $('#recipe-time').value.trim(), servings = $('#recipe-servings').value.trim();
    const ing = getLines(ingredients), inst = getLines(instructions);
    if (!title || !description || !time || !servings || !ing.length || !inst.length) {
      say('Fill in the recipe details, at least one ingredient, and at least one instruction.', 'error'); return;
    }
    button.disabled = true; say(editing ? 'Saving changes...' : 'Creating recipe...');
    const mine = await getMyRecipes(user.uid);
    const recipe = {id: original?.id || 'my-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8), title, description, time, servings, ingredients:ing, instructions:inst, image, isUserRecipe:true};
    const updated = editing ? mine.map(r => r.id === original.id ? recipe : r) : [...mine,recipe];
    if (saveMyRecipes(user.uid,updated)) {
      $('#recipe-message').textContent = editing ? 'Recipe updated!' : 'Recipe created!';
      say(editing ? 'Recipe updated!' : 'Recipe created!', 'success');
      try { sessionStorage.setItem('jungle-cook-message', editing ? 'Recipe updated!' : 'Recipe created!'); } catch {}
      window.location.href = 'your-recipes.html';
    } else button.disabled = false;
  });
}
if (page === 'browse') drawBrowse();
if (['your', 'view', 'create', 'edit'].includes(page)) {
  import('./firebase-auth.js').then(({ auth, onAuthStateChanged }) => {
    onAuthStateChanged(auth, user => {
      if (page === 'your') drawMine(user);
      if (page === 'view') drawDetail(user);
      if (page === 'create') setupEditor(user, false);
      if (page === 'edit') setupEditor(user, true);
    }, () => say('Could not check your account. Please reload.', 'error'));
  }).catch(() => say('Cannot connect to Firebase. Check your internet connection.', 'error'));
}
