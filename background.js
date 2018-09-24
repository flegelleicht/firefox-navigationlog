// Load existent stats with the storage API.
var storedLog = browser.storage.local.get();

storedLog.then(results => {
  // Initialize the log if not yet initialized.
  if (results) {
    results = { log: [] };
  }
  
  var navigationStarts = [];
  browser.webNavigation.onCreatedNavigationTarget.addListener((evt) => {
    console.log(`onCreatedNavigationTarget: ${evt.frameId}`)
    if (evt.frameId !== 0) { return; }
    
    var gettingFrame = browser.webNavigation.getFrame({
      tabId: evt.sourceTabId,
      frameId: evt.sourceFrameId
    });
    gettingFrame.then(
      (frameInfo) => {
        console.log(`onCreatedNavigationTarget: gettingFrame ${frameInfo.url}`)
        
        let currentUrl = frameInfo.url;
        let nextUrl = evt.url;
        let timestamp = evt.timeStamp;
        
        let entry = { 
          at: timestamp, 
          from: currentUrl, 
          to: nextUrl
        };
        
        navigationStarts.push(entry);
        console.log(`onCreatedNavigationTarget: ${navigationStarts.length}`)
      },
      (error) => {
        console.log(`Error in onCreatedNavigationTarget: ${error}`);
      }
    );
  });
  
  browser.webNavigation.onBeforeNavigate.addListener((evt) => {
    console.log(`onBeforeNavigate: ${evt.frameId}`)
    
    if (evt.frameId !== 0) { return; }

    var gettingFrame = browser.webNavigation.getFrame({
      tabId: evt.tabId,
      frameId: evt.frameId
    });
    gettingFrame.then(
      (frameInfo) => {
        console.log(`onBeforeNavigate: gettingFrame ${frameInfo.url}`)
        
        let currentUrl = frameInfo.url;
        let nextUrl = evt.url;
        let timestamp = evt.timeStamp;
        
        let entry = { 
          at: timestamp, 
          from: currentUrl, 
          to: nextUrl
        };
        
        navigationStarts.push(entry);
        console.log(`onBeforeNavigate: navigationStarts.length:  ${navigationStarts.length}`)
        
      },
      (error) => {
        console.log(`Error in onBeforeNavigate: ${error}`);
      }
    );
  });

  // Monitor completed navigation events and update
  // stats accordingly.
  browser.webNavigation.onCommitted.addListener((evt) => {
    if (evt.frameId !== 0) {
      return;
    }

    // find corresponding navigation start
    var start = navigationStarts.filter(s => s.to === evt.url)[0];
    
    if(start) {
      navigationStarts = navigationStarts.filter(s => s.to !== evt.url);
      // let transitionType = evt.transitionType;
      // results.type[transitionType] = results.type[transitionType] || 0;
      // results.type[transitionType]++;

      // Persist the updated stats.
      results.log.push(start);
      browser.storage.local.set(results);
      console.log(`onCommitted: navigationStarts.length:  ${navigationStarts.length}`)
      
    } else {
      console.log(`Could not find corresponding navigation start for ${evt.url}`);
    }

  });

  browser.webNavigation.onCompleted.addListener(evt => {
    // Filter out any sub-frame related navigation event
    if (evt.frameId !== 0) {
      return;
    }

    // const url = new URL(evt.url);
    //
    // results.host[url.hostname] = results.host[url.hostname] || 0;
    // results.host[url.hostname]++;
    //
    // // Persist the updated stats.
    // browser.storage.local.set(results);
  }, {
    url: [{schemes: ["http", "https"]}]});
});
