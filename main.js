const tabId = parseInt(window.location.search.substring(1), 10);

// Define Action and Events
// Redux/Flux style
const NetworkEvents = {
  BeforeSendRequest: 'Network.requestWillBeSent',
  GettingReponse: 'Network.responseReceived',
};

const NetworkActions = {
  Enable: 'Network.enable',
  GetResponseBody: 'Network.getResponseBody',
};

// Set Events Listeners. And unsubscribe on unload.
window.addEventListener('load', () => {
  chrome.debugger.sendCommand({ tabId }, NetworkActions.Enable);
  chrome.debugger.onEvent.addListener(onEvent);
});

window.addEventListener('unload', () => chrome.debugger.detach({ tabId }));

// TODO Remove this global variable and create Class for handling.
let requests = {};

function onEvent(debuggeeId, message, params) {
  if (tabId != debuggeeId.tabId) { return; }

  const { BeforeSendRequest, GettingReponse } = NetworkEvents;

  // Like Redux/Flux Reducer
  switch (message) {
    case BeforeSendRequest:
      BeforeSendRequestHandler(params);
      break;
    case GettingReponse:
      GettingReponseHandler(debuggeeId, params);
      break;
    default:
      console.log('No handlers for this action type %s', message);
      break;
  }
}

function BeforeSendRequestHandler({ requestId, request: { url } }) {
  let requestDiv = requests[requestId];

  if (!requestDiv) {
    requestDiv = document.createElement('div');
    requestDiv.className = 'request';
    requests[requestId] = requestDiv;

    const urlLine = document.createElement('div');
    urlLine.textContent = url;

    requestDiv.appendChild(urlLine);
  }

  document.getElementById('container').appendChild(requestDiv);
}

function GettingReponseHandler({ tabId }, params) {
  const { requestId } = params;

  chrome.debugger.sendCommand(
    { tabId },
    NetworkActions.GetResponseBody,
    { requestId },
    (response) => appendResponse(requestId, params, response)
  );
}

function appendResponse(requestId, response, bodyResponse = { body }) {
  const requestDiv = requests[requestId];
  const { body } = bodyResponse;

  if (!requestDiv || !body) { return; }

  // Here you can handle response body.

  const bodyElement = document.createElement('pre');
  bodyElement.textContent = body;
  requestDiv.appendChild(bodyElement);
}
