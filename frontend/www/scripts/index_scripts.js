document.getElementById("bodyIdIndex").onload = function() {onLoad()};

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

// urls for services
const jobUrl = "/api/jobs/"
const solverUrl = "/api/solver/"
const fileUrl = "/api/fs/"
const authUrl = "/api/auth/"

function onLoad(){
    // Is user logged in?
    if (localStorage.getItem("token") === null || localStorage.getItem("token") === "defined" || parseJwt(localStorage.getItem("token")).expiration > Date.now()) {
      window.location.href = "login.html";
    }

    // Find the available solvers and available models and load the check buttons for the available solvers
    getAvailableSolvers()
    getAvailableModels()

    // Activate the settings button (if admin user)
    isUserAdmin()

    // Calls DB that holds solutions
    getSolvedSolutions()
}

function uploadModel(){
  var input = document.querySelector('input[type="file"]')

  var uuid = parseJwt(localStorage.getItem("token")).uuid

  var data = new FormData()
  data.append('file', input.files[0])

  if(fileUrl != null){
    fetch(fileUrl + uuid, {
      headers: {
        'Authorization':'Bearer ' + localStorage.getItem("token")
      },
      body: data,
      method: "PUT"
    })
    .then((response) => response.json())
    .then((result) => {

      console.log(result)

    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }
}

function getAvailableModels(){
  // Get the list of models  the user has available

  // Might need to change?
  var uuid = parseJwt(localStorage.getItem("token")).uuid

  modelList = document.getElementById("modelList");

  if(fileUrl != null){
    fetch(fileUrl + uuid + "/list", {
      headers: {
        'Authorization':'Bearer ' + localStorage.getItem("token")
      },
      method: "GET"
    })
    .then((response) => response.json())
    .then((result) => {

      console.log(result);

      let modelParser = new DOMParser();

      result.lst.forEach(model => {
        let modelToAppend = modelParser.parseFromString('<li class="list-group-item">"' + model.name + '"<button id="' + model.id + '" class="btn btn-outline-primary btn-sm position-absolute top-50 end-0 translate-middle-y" onclick="startJob(this.id)" type="button">SolveIt!</button></li>', 'text/html');
        modelList.append(modelToAppend.childNodes[0].childNodes[1].childNodes[0]);
      });

    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  if(modelList.childElementCount == 0){
    let modelParser = new DOMParser();
    let modelToAppend = modelParser.parseFromString('<li class="list-group-item">fake.mzn<button id="28f458fb-7009-43e8-bea6-feec82a90aec" class="btn btn-outline-primary btn-sm position-absolute top-50 end-0 translate-middle-y" onclick="startJob(this.id)" type="button">SolveIt!</button></li>', 'text/html');
    modelList.append(modelToAppend.childNodes[0].childNodes[1].childNodes[0]);
  }
}

function deleteModel(fileId){

  // Might need to change?
  var uuid = parseJwt(localStorage.getItem("token")).uuid

  if(fileUrl != null){
    fetch(fileUrl + uuid + '/' + fileId, {
      method: "DELETE",
      headers: {
        'Authorization':'Bearer ' + localStorage.getItem("token")
      }
    })
    .then((response) => response.json())
    .then((result) => {

      console.log("Delete file result " + result)

    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }
}

function getAvailableSolvers(){
    // Get the list of solvers the user has available
    solverList = document.getElementById("solverSelectWrapper")

    if(solverUrl != null){
      fetch(solverUrl + "solver", {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Access-Control-Allow-Origin':'*',
          'Authorization':'Bearer {' + localStorage.getItem("token") + "}"
        }
      })
        .then((response) => response.json())
        .then((result) => {

          console.log("get solvers result: ", result)

          solverList.innerHTML = "";
          let solverParser = new DOMParser();

          result.forEach(solver => {
            let solverToAppend = solverParser.parseFromString(`
            <div class="input-group mb-3">
              <div class="input-group-text">
                <input class="form-check-input mt-0" type="checkbox" value="" aria-label="Checkbox for following text input">
              </div>
              <span id="` + solver.id + `"  class="input-group-text solver-name-class">` + solver.name + `</span>
              <input type="text" aria-label="vcpu" placeholder="VCPU (Default: 1)" class="form-control vcpu-class">
              <input type="text" aria-label="ram" placeholder="RAM (Default: 1024)" class="form-control ram-class">
            </div>
            `, 'text/html')


            solverList.append(solverToAppend.childNodes[0].childNodes[1].childNodes[0])
          })

        })
        .catch((error) => {
          console.error(error);
        });
    }

    if(solverList.childElementCount == 0){
      let solverParser = new DOMParser();

      let solverToAppend = solverParser.parseFromString(`
            <div class="input-group mb-3">
              <div class="input-group-text">
                <input class="form-check-input mt-0" type="checkbox" value="" aria-label="Checkbox for following text input">
              </div>
              <span id="213c7f36-dad8-4316-aaac-1a43a4f9062c" class="input-group-text solver-name-class">fake-solver</span>
              <input type="text" aria-label="vcpu" placeholder="VCPU (Default: 1)" class="form-control vcpu-class">
              <input type="text" aria-label="ram" placeholder="RAM (Default: 1024)" class="form-control ram-class">
            </div>
            `, 'text/html')

      solverList.append(solverToAppend.childNodes[0].childNodes[1].childNodes[0])
    }
}

function isUserAdmin(){
    // Check token to see if user is admin

    if (authUrl != null) {
      fetch(authUrl + "users/get_my_permissions" , {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Access-Control-Allow-Origin':'*',
          'Authorization':'Bearer ' + localStorage.getItem("token")
        }
      })
        .then((response) => response.json())
        .then((result) => {

          console.log("permissions results:", result)

          tokenDecode = parseJwt(localStorage.getItem("token"))

          // Not finished
          if(tokenDecode.message.is_admin == true){
            settingsElement = document.getElementById("settingsAId");
            settingsElement.classList.remove("disabled");
            settingsElement.setAttribute("aria-disabled", "false");
          }

        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
}

function getSolvedSolutions(){
    // Get solved solutions from job service
    let wrapperDiv = document.getElementById("runningSolutionsWrapper");
    let wrapperFinishedJobs = document.getElementById("accordionWrapper");

    if (jobUrl != null) {
      fetch(jobUrl + "job", {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Access-Control-Allow-Origin':'*',
          'Authorization':'Bearer ' + localStorage.getItem("token")
        }
      })
        .then((response) => response.json())
        .then((result) => {

          let jobParser = new DOMParser();

          wrapperDiv.innerHTML = ""

          result.forEach(element => {

            if(element.status == "running"){
              //Build a solver html div
              runningSolutionDiv = document.createElement("div");
              runningSolutionDiv.id = "runningSolution-" + element.id
              runningSolutionDiv.classList.add("runningSolution")
              runningSolutionDiv.classList.add("m-3")

              runningSolutionP = document.createElement("p");
              runningSolutionP.id = "running_solver_instance_header" + element.id
              runningSolutionP.classList.add("mt-1")
              runningSolutionP.classList.add("d-flex")
              runningSolutionP.classList.add("w-100")
              runningSolutionP.classList.add("justify-content-between")


              runningSolutionSpan = document.createElement("span");
              runningSolutionSpan.textContent = "Name: missing, Started: " + element.time_created

              runningSolutionP.appendChild(runningSolutionSpan)

              let runningJob = jobParser.parseFromString('<button id="' + element.id + '" class="btn btn-outline-danger btn-sm" onclick="stopRunningJob(this.id)" type="button">Delete job</button>', 'text/html')
              runningSolutionP.append(runningJob.documentElement)

              runningSolutionUL = document.createElement("ul");
              runningSolutionUL.id = "running_instance_solver_list" + element.id
              runningSolutionUL.classList.add("list-group")

              getRunningSolvers(element.id, runningSolutionUL);

              runningSolutionDiv.appendChild(runningSolutionP)
              runningSolutionDiv.appendChild(runningSolutionUL)
              wrapperDiv.appendChild(runningSolutionDiv);

            } else {
              wrapperFinishedJobs.innerHTML = "";
              getStoppedSolvers(element);

            }
          });

        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }

    // Is the running justs empty?
    let runningChildCount = wrapperDiv.childElementCount;
    if(runningChildCount == 0){
      wrapperDiv.innerHTML = "<h4 class='m-3'>You have no running jobs</h4>"
    }

    let finishedChildCount = wrapperFinishedJobs.childElementCount;
    if(finishedChildCount == 0){
      wrapperFinishedJobs.innerHTML = "<h4 class='m-3'>You have no finished jobs</h4>"
    }
}

function getRunningSolvers(solutionInstanceId, runningSolutionUL){

  console.log("instance id: ", solutionInstanceId)

  fetch(jobUrl + "job/" + solutionInstanceId + "/solvers", {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Access-Control-Allow-Origin':'*',
      'Authorization':'Bearer ' + localStorage.getItem("token")
    }
  })
    .then((response) => response.json())
    .then((result) => {

      let instanceParser = new DOMParser();

      result.forEach(instance => {

        let listItem = instanceParser.parseFromString('<li id="runningSolverId-' + instance.id + '" class="list-group-item">Solver: ' + instance.name + '<button id="' + instance.id + '" class="btn btn-outline-danger btn-sm position-absolute top-50 end-0 translate-middle-y" onClick="stopInstance(this.id, '+ solutionInstanceId.toString() +')" type="button">Remove running solver</button></li>', 'text/html')
        runningSolutionUL.append(listItem.documentElement)

      });


    })
    .catch((error) => {
      console.error('Error:', error);
    });

}

function getStoppedSolvers(stoppedJob){

  let wrapperFinishedJobs = document.getElementById("accordionWrapper");

  let itemstring = `<div class="accordion-item">
                      <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                          ` + "Solver: " + stoppedJob.solver + " Create date: " + stoppedJob.createdTime + " Status: " + stoppedJob.status `
                        </button>
                      </h2>
                      <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                        <div class="accordion-body">
                          ` + "Result: " + stoppedJob.result + `
                        </div>
                        <button class="accordion-button danger btn" type="button">
                          Delete result
                        </button>
                      </div>
                    </div>`;

  wrapperFinishedJobs.append(itemstring)

}

function stopRunningJob(jobId){
  console.log("Stopped job: " + jobId)

  fetch(jobUrl + "job/" + jobId, {
    method: 'DELETE',
    mode: 'cors',
    headers: {
      'Access-Control-Allow-Origin':'*',
      'Authorization':'Bearer ' + localStorage.getItem("token")
    }
  })
    .then((response) => response.json())
    .then((result) => {

      console.log("stop job: ", result)

      jobToDelete = document.getElementById("runningSolution-" + jobId);
      jobToDelete.remove();

    })
    .catch((error) => {
      console.error('Error:', error);
    });

  let wrapper = document.getElementById("runningSolutionsWrapper");
  let childCount = wrapper.childElementCount;
  if (childCount == 0){
    console.log("Found running solutionWrapper to be empty")
    wrapper.innerHTML = "<h4 class='m-3'>You have no running jobs</h4>"
  }

  

}

function startJob(modelIds){

  solverCheckingList = document.getElementById("solverSelectWrapper");
  const solverList = []

  for(let x of Array.from(solverCheckingList.children)) {

    if(x.querySelector(".form-check-input").checked == true){
      solverList.push('{"id": "' + x.querySelector("span.solver-name-class").id + '", "name": "'+ x.querySelector("span.solver-name-class").innerHTML +'", "vcpu":'+ x.querySelector(".vcpu-class").value +' ,"ram": '+ x.querySelector(".ram-class").value +'}')
    }

  }

  console.log(solverList)

  fetch(jobUrl + "job", {
    method: 'POST',
    mode: 'cors',
    body: `{
      "mzn_id": "` + modelIds + `",
      "timeout": 120,
      "solver_list": [` + solverList.toString() + `]
    }`,
    headers: {
      'Access-Control-Allow-Origin':'*',
      'Authorization':'Bearer ' + localStorage.getItem("token"),
      'Content-Type': 'application/json',
      'accept': 'application/json'
    }
  })
    .then((response) => response.json())
    .then((result) => {

      console.log("", result)

    })
    .catch((error) => {
      console.error('Error:', error);
    });


}

function stopInstance(instanceId, jobId){
  console.log("Stopped instance: " + instanceId)

  fetch(jobUrl + "job/" + jobId + "/" + instanceId, {
    method: 'DELETE',
    mode: 'cors',
    headers: {
      'Access-Control-Allow-Origin':'*',
      'Authorization':'Bearer ' + localStorage.getItem("token")
    }
  })
    .then((response) => response.json())
    .then((result) => {

      console.log("stop instance: ", result)
      jobToDelete = document.getElementById("runningSolverId-" + instanceId);
      jobToDelete.remove();

    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

function parseJwt (token) {

  var base64Url = token.split('.')[1];

  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}


function logout(){
    // Delete session token
    localStorage.removeItem("token");

    // Back to login
    window.location.href = "login.html";
}