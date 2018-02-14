const googleMapsURL: string = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCg0wHL6JicnbXQLXUwtHL-t5iYEND-VUw&libraries=places&callback=__abcMapLoad";

export class MapLoader {

    private static promise;

    public static load(): Promise<any> {
        if (!MapLoader.promise) {
            MapLoader.promise = new Promise((resolve) => {
                window['__abcMapLoad'] = (ev) => {
                    console.log("window['google']",window['google'])
                    resolve(window['google']['maps']);
                };
                let node = document.createElement('script');
                node.src = googleMapsURL;
                node.type = 'text/javascript';
                document.getElementsByTagName('head')[0].appendChild(node);
            });
        }
        return MapLoader.promise;
    }
}