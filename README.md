# A lightweight universal analytics library.

This will allow you to add analytics vendors (Google Analytics, MixPanel, QuantCast, HubSpot etc.) by just specifying the profile ID parameter and exposes universal hooks into those libraries for one-liner analytics calls.

## Sample implementation:
* Load your vendors:
```
Analytics.addVendor('ga', {id: 'UA-123-4'});
Analytics.addVendor('mixpanel', {id: "1234"});
```
* Initialize vendors:
```
Analytics.initAll();
```
* Call a page view:
```
Analytics.pageView();
```

## Additional calls:
* Analytics.track([OPTS])
```
Analytics.track(['Signup', 'Start Signup']);
```
* Analytics.call(VENDOR,NESTED_CALL,OPTS)
```
Analytics.call('mixpanel','people.increment', 'page_views');
```
* Analytics.callAll(CALL, OPTS)
```
Analytics.callAll('track', 'Page View');
```
* Analytics.addVendor(KEY,OPTS)
```
Analytics.addVendor('newvendor', {
  name: "newvendor"
});
```
* Analytics.pageView(URL)
```
Analytics.pageView(document.URL);
```

### This software is open sourced under the MIT license.
