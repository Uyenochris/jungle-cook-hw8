# Jungle Cook - N315 Homework 8

Jungle Cook is a recipe website built for N315. This Homework 8 project continues the Home and Login pages from Homework 6 and the Firebase Authentication from Homework 7. It includes the rest of the recipe pages and works on desktops, tablets, and phones.

## Live website

**Web4 URL after upload:** `https://in-info-web4.luddy.indianapolis.iu.edu/~cjuyeno/jungle-cook-hw8/`

**GitHub:** Add your Homework 8 repository link here after uploading it.

> The Web4 address above is the intended address. It will not work until all files have been uploaded to that folder.

## Pages and features

- **Home (`index.html`)**: Jungle Cook introduction with the pizza image, pastel circles, and navigation.
- **Login (`login.html`)**: Sign up and sign in with email/password using Firebase Authentication. Users can also log out. The menu changes from Login to Logout and adds Your Recipes when signed in.
- **Browse (`browse.html`)**: Loads four example recipes from `data/recipes.json` using `fetch()` and shows pictures, descriptions, preparation times, and servings.
- **View (`recipe.html?id=...`)**: Shows a recipe's picture, ingredients, directions, time, and servings.
- **Create (`create.html`)**: A signed-in user can enter a recipe name, description, time, servings, ingredients, instructions, and optional picture. The plus buttons add more ingredient and instruction fields.
- **Your Recipes (`your-recipes.html`)**: Shows recipes for the signed-in browser account, with View, Edit, and Delete buttons. New accounts get a copy of the Supreme Pizza recipe as an example.
- **Edit (`edit.html?id=...`)**: A signed-in user can update a recipe that belongs to them.
- **Privacy (`privacy.html`)**: Simple information about how this class project handles data.

## How the data works

1. `data/recipes.json` is the **local JSON file** included with the website. It contains the four public sample recipes (Supreme Pizza, Classic Burger, Chicken Biryani, and Chow Mein).
2. `recipes.js` uses `fetch('data/recipes.json')` to read the JSON and dynamically generate recipe cards and details.
3. Firebase Authentication handles **creating accounts, signing in, and signing out**. The same Firebase project used in Homework 7 (`jungle-cook-hw7`) is configured in `firebase-auth.js`.
4. For this class version, new or edited personal recipes are stored in **browser localStorage**, in separate keys based on the signed-in user's Firebase UID. They stay saved after refreshing the page in that browser.
5. **Important limitation:** Personal recipes are **not stored in Firebase Firestore**. They do not sync between different browsers/devices, and clearing browser data will delete them. This can be improved in a future assignment by adding Firestore.
6. A selected recipe photo is resized in the browser and stored with the recipe. Smaller photos save more reliably.

## User feedback

The site shows messages when recipes are loading, when an image is attached, when a recipe is saved/deleted, and if a request fails or form details are missing. Firebase login errors appear by the form. The Delete button asks for confirmation.

## Tools used

- HTML and CSS with media queries for the layouts
- Plain JavaScript (no React or build tools)
- Firebase Web SDK for email/password authentication
- A local JSON file read using `fetch()`
- Browser `localStorage` for recipe changes

## Project files

- `index.html`, `login.html`, `browse.html`, `recipe.html`, `create.html`, `edit.html`, `your-recipes.html`, `privacy.html`
- `styles.css` - all styles and responsive rules
- `script.js` - mobile hamburger menu and feedback messages
- `firebase-auth.js` - Firebase setup and sign in/up/out
- `recipes.js` - reading JSON, building recipe cards, creating/editing/deleting recipes
- `data/recipes.json` - sample recipe data
- `assets/` - food photographs, backgrounds, logo, and icons from the class Jungle Cook assets

## How to run

The site should be opened from a web server rather than by double-clicking `index.html`. This is because JavaScript loads the local JSON file using `fetch()` and the Firebase SDK needs an internet connection.

1. Upload **the contents of this project folder** into your Web4 `public_html/jungle-cook-hw8/` folder using Cyberduck.
2. Check that `index.html` is **directly inside** `jungle-cook-hw8` (not in a nested `dist` folder).
3. Go to `https://in-info-web4.luddy.indianapolis.iu.edu/~cjuyeno/jungle-cook-hw8/`.
4. Choose Browse to see JSON recipes.
5. Sign up or log in using your Homework 7 Firebase account, then use Create Recipe and Your Recipes.

For local testing, you can run `python -m http.server 8000` from the project folder and open `http://localhost:8000/`.

## Firebase setup

Firebase Authentication in the `jungle-cook-hw7` Firebase project needs the **Email/Password** sign-in method enabled. The Firebase Web API configuration is public client configuration and does **not** contain a service account private key. Do not commit private credentials or passwords.

If Firebase shows `auth/unauthorized-domain`, open Firebase Console > Authentication > Settings > Authorized domains and add the hostname where you are hosting the site if Firebase lets you add it. Test login on your actual Web4 domain before submitting.

## Testing checklist

- [ ] Home and Login look right on a desktop and on a 1024x768 tablet.
- [ ] Hamburger menu opens and closes on narrow screens.
- [ ] Browse shows the four sample recipes.
- [ ] View Recipe shows the ingredients and instructions.
- [ ] Email/password login and logout work, and the navigation changes.
- [ ] Create Recipe saves the new recipe and shows it under Your Recipes.
- [ ] Edit Recipe changes your saved recipe.
- [ ] Delete Recipe asks for confirmation and deletes the recipe.
- [ ] An empty or incomplete form shows an error message.

## What I would improve later

Save personal recipes in Firestore so the same account can see them on other devices, add more recipes, and add more recipe categories/search.
