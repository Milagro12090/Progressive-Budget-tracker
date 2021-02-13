let db;

// request for budget db, 1 
const request = indexedDB.open("budget", 1);

//onupgradeneeded, will create a object store called pending. 
request.onupgradeneeded = function(event) {
  const db = event.target.result;
  //set autoinc to true
  db.createObjectStore("pending", { autoIncrement: true });
};

//after success on everything before check to see if the app is running
request.onsuccess = function(event) {
  db = event.target.result;

  // reads from indexDB
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(event) {
  console.log("Woops! " + event.target.errorCode);
};

//save record function for if something fails or if we are in offline mode
function saveRecord(record) {
 //transaction object for reading writing data through indexdb 
  const transaction = db.transaction(["pending"], "readwrite");
  //pending object store
  const store = transaction.objectStore("pending");
  //adding to store with .add
  store.add(record);
}

function checkDatabase() {
  //open transavtion to pending db
  const transaction = db.transaction(["pending"], "readwrite");
  //access to the pending db
  const store = transaction.objectStore("pending");
  //getall and then store
  const getAll = store.getAll();

  //on success fetch and post
  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      //.then for response from JSON
      .then(response => response.json())
      .then(() => {
        
        const transaction = db.transaction(["pending"], "readwrite");

        // pending object store
        const store = transaction.objectStore("pending");

        // clear
        store.clear();
      });
    }
  };
}

window.addEventListener("online", checkDatabase);
