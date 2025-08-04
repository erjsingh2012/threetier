import { StorageManager } from "./resources/managers/StorageManager.js"; 
import { ApiManager } from "./resources/managers/ApiManager.js";

const storageManager = new StorageManager();
const apiManager = new ApiManager('');

async function startApp() {
  await storageManager.init();
  await apiManager.init();

  storageManager.set('welcomeMessage', 'Welcome to the Game App!');
  console.log(storageManager.get('welcomeMessage'));
  try {
    const data = await apiManager.get('https://jsonplaceholder.typicode.com/posts');
    console.log('Games data:', data);
  } catch (error) {
    console.error('Error fetching games:', error);
  }
}
startApp().then(() => {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('app').style.display = 'block';
}).catch(error => {
  console.error('Error starting app:', error);
  document.getElementById('loading').innerText = 'Failed to load the app.';
});