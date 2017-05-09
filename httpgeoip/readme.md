# HTTP GeoIP

The component obtains locality according to the IP address. Received data has to contain `data.ip` field with IP address. If the component will obtain Geo informations then it extends a current data object about a new field `geoip` and sends all data next.

```javascript
response.geoip;     // Object { country_code: 'SK', country_name: 'Slovakia', city: '', region_code: '', region_name: '', zip_code: '', time_zone: '', latitude: 51.2993, longitude: 9.491 }
```