'use strict';

/**
 * @ngdoc controller
 * @name shop.module.controller:ShopHomeCtrl
 * @requires $scope
 * @requires $localStorage
 * @requires $rootScope
 * @requires $stateParams
 * @requires $ionicSlideBoxDelegate
 * @requires ShopService
 * @description
 * Home page of the Shop module. This controller contains methods to show banners and product catalog in
 * the home page.
 */
angular
  .module('shop.module')
  .controller('ShopHomeCtrl', function ($scope, $localStorage, $rootScope, $stateParams, $ionicSlideBoxDelegate, ShopService) {
    var vm = this;
    $scope.endOfRLatestItems = false;
    $scope.loadingLatest = false;

    // sync form input to localstorage
    $localStorage.home = $localStorage.home || {};
    $scope.data = $localStorage.home;
    $scope.data.latestPage = 1;

    if (!$scope.data.slides){
      $scope.data.slides = [{image: "app/shop/images/logo.png"}];
    }

    $scope.refreshUI = function () {
      $scope.data.latestPage = 1;
      $scope.endOfRLatestItems = false;
      $scope.loadLatest(true);
      $scope.loadFeatured();
      //$scope.loadCategories();
      $scope.loadBanners();
    }

    $scope.loadBanners = function () {
      ShopService.GetBanners().then(function (data) {
        $scope.data.slides = data.main_banners;
        $scope.data.offers = data.offer_banner;
        $ionicSlideBoxDelegate.update();
      });
    }

    $scope.loadFeatured = function () {
      ShopService.GetFeaturedProducts().then(function (data) {
        $scope.data.featuredItems = data.products;
        $ionicSlideBoxDelegate.update();
      });
    }

    $scope.loadLatest = function (refresh) {
      if ($scope.loadingLatest) {
        return;
      }

      $scope.loadingLatest = true;
      $scope.data.latestItems = $scope.data.latestItems || [];

      ShopService.GetShops($scope.data.latestPage).then(function (data) {
        if (refresh) {
          $scope.data.latestItems = data.shops;
          $scope.data.latestPage = 1;
        } else {
          if ($scope.data.latestPage == 1) {
            $scope.data.latestItems = [];
          }

          $scope.data.latestItems = $scope.data.latestItems.concat(data.shops);
          $scope.data.latestPage++;
        }
        if (data.shops && data.shops.length < 1)
          $scope.endOfRLatestItems = true;
        $scope.loadingLatest = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.$broadcast('scroll.refreshComplete');
      }, function (data) {
        $scope.loadingLatest = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    $scope.loadNextRecentPage = function () {
      if (!$scope.endOfRLatestItems) {
        $scope.loadLatest();
      } else {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }
    }

    $scope.$on('$ionicView.enter', function () {
      $ionicSlideBoxDelegate.update();
    });

    $scope.$on('i2csmobile.shop.refresh', function () {
      $scope.refreshUI();
    });

    $scope.loadFeatured();
    $scope.loadBanners();
  });


/**
 * @ngdoc controller
 * @name shop.module.controller:ShopItemCtrl
 * @requires $scope
 * @requires $timeout
 * @requires $localStorage
 * @requires $rootScope
 * @requires $state
 * @requires $stateParams
 * @requires $ionicPopup
 * @requires $ionicLoading
 * @requires $ionicTabsDelegate
 * @requires $ionicSlideBoxDelegate
 * @requires locale
 * @requires ShopService
 * @requires CartService
 * @requires WEBSITE
 * @description
 * Shows details of a selected item. Renders all attributes and options in the view.
 * Contains a `Buy` button which interacts with the API and add to product cart.
 */
angular
  .module('shop.module')
  .controller('ShopItemCtrl', function ($scope, $timeout, $localStorage, $rootScope, $state, $cordovaGeolocation, $stateParams, $ionicPopup, $ionicLoading, $ionicTabsDelegate, $ionicSlideBoxDelegate, $compile, locale, ShopService, CartService, WEBSITE) {
    function initialize() {
      var myLatlng = new google.maps.LatLng($scope.item.latitude, $scope.item.longitude);

      var mapOptions = {
        center: myLatlng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      var map = new google.maps.Map(document.getElementById("map"),
        mapOptions);

      // Marker + infowindow + angularjs compiled ng-click
      // var contentString = "<div><a ng-click='clickTest()'>" + $scope.item.company + "</a></div>";
      // var compiled = $compile(contentString)($scope);

      // var infowindow = new google.maps.InfoWindow({
      //   content: compiled[0]
      // });

      var infowindow = new google.maps.InfoWindow();

      var marker = new google.maps.Marker({
        position: myLatlng,
        map: map
      });

      //Search Nearby
      // var request = {
      //   location: myLatlng,
      //   radius: 5000,
      //   type: ['restaurant']
      // };
      //
      // var locations = [];
      // var marker, i;
      //
      // // $scope.getUsers = function () {
      // ShopService.LoadAllUsers().then(function (data) {
      //   data.users.forEach(function(element){
      //     locations.push([element.company, element.latitude, element.longitude]);
      //   });
      //   console.log(data.users[0].company);
      //   console.log(data.users[0].latitude);
      //   console.log(data.users[0].longitude);
      // }, function (data) {
      //   // $ionicLoading.hide();
      // });
      //
      // // }
      //
      // var service = new google.maps.places.PlacesService(map);
      // service.nearbySearch(request, callback);
      //
      // function callback() {
      //   for (i = 0; i < locations.length; i++) {
      //     marker = new google.maps.Marker({
      //       position: new google.maps.LatLng(locations[i][1], locations[i][2]),
      //       map: map,
      //       title: locations[i][0]
      //     });
      //
      //     google.maps.event.addListener(marker, 'click', (function(marker, i) {
      //       return function() {
      //         infowindow.setContent(locations[i][0]);
      //         infowindow.open(map, marker);
      //       }
      //     })(marker, i));
      //   }
      // }

      google.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent('<strong>' + $scope.item.company || $scope.item.firstname + '</strong>');
        infowindow.open(map, marker);
      });
      $scope.map = map;

    }

    google.maps.event.addDomListener(window, 'load', initialize);

    $scope.navigate = function () {
      launchnavigator.navigate([$scope.item.latitude, $scope.item.longitude]);
    }

    $scope.centerOnMe = function () {
      if (!$scope.map) {
        return;
      }

      $scope.loading = $ionicLoading.show({
        content: 'Getting current location...',
        showBackdrop: false
      });

      navigator.geolocation.getCurrentPosition(function (pos) {
        var mylatlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        var myitemlatlng = new google.maps.LatLng($scope.item.latitude, $scope.item.longitude);
        $scope.calcRoute(mylatlng, myitemlatlng);
        $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
        launchnavigator.navigate([$scope.item.latitude, $scope.item.longitude], {
          start: [pos.coords.latitude, pos.coords.longitude]
        });
        // $scope.loading.hide();
      }, function (error) {
        alert('Unable to get location: ' + error.message);
      });
    };

    var directionsDisplay = new google.maps.DirectionsRenderer();
    var directionsService = new google.maps.DirectionsService();

    $scope.calcRoute = function (start, end) {
      //var start =
      //var end = new google.maps.LatLng(37.441883, -122.143019);
      var request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING
      };
      directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(response);
          directionsDisplay.setMap($scope.map);
        } else {
          alert("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
        }
      });
    };

    $scope.clickTest = function () {
      alert('Example of infowindow with ng-click')
    };

    var vm = this;
    $scope.shop = {};
    $scope.cart = {};
    $scope.cart.quantity = 1;
    $scope.id = $stateParams.id;


    $scope.$on('$ionicView.enter', function () {
      $timeout(function () {
        $ionicTabsDelegate.$getByHandle('product-tabs').select(0);
      }, 0)
    });

    $localStorage.item_cache = $localStorage.item_cache || {};
    $scope.item_cache = $localStorage.item_cache;

    $ionicLoading.show();

    // check cache for the item. if item is available, immediately assign it
    if ($scope.item_cache.items && $scope.item_cache.items[$stateParams.id])
      $scope.item = $scope.item_cache.items[$stateParams.id];

    if (window.Connection) {
      if (navigator.connection.type == Connection.NONE) {
        if (!$scope.item) {
          alert(locale.getString('shop.error_not_connected_cache_failed'));
        } else {
          alert(locale.getString('shop.error_not_connected_cache_success'));
        }

        $ionicLoading.hide();
      }
    }


    ShopService.GetProduct($stateParams.id).then(function (data) {
      $scope.item = {};

      $scope.item.name = data.heading_title;
      $scope.item.product_id = data.product_id;
      $scope.item.user_id = data.separate_u_user_id;

      $scope.item.text_stock = data.text_stock;
      $scope.item.text_model = data.text_model;
      $scope.item.attribure_groups = data.attribute_groups;
      $scope.item.shop_name = data.shop_name;
      $scope.item.price = data.price;
      $scope.item.firstname = data.separate_u_name;
      $scope.item.company = data.company;
      $scope.item.user_id = data.separate_u_user_id;
      $scope.item.telephone = data.separate_u_phone;
      $scope.item.location = data.location;
      $scope.item.latitude = data.latitude;
      $scope.item.longitude = data.longitude;
      $scope.item.special = data.special;
      $scope.item.description = data.description;
      $scope.item.off = data.off;
      $scope.item.mobile_special = data.mobile_special;
      $scope.item.stock = data.stock;
      $scope.item.model = data.model;
      $scope.item.options = data.options;
      $scope.item.minimum = data.minimum || 1;
      $scope.item.review_status = data.review_status;
      $scope.item.review_guest = data.review_guest;
      $scope.item.reviews = data.reviews;
      $scope.item.rating = data.rating;
      $scope.item.entry_name = data.entry_name;
      $scope.item.entry_review = data.entry_review;

      $scope.item.related = data.products;


      $scope.item.thumb = data.thumb;

      $scope.item.image = data.image;

      $scope.item.images = data.images;


      if (!$scope.item_cache.items)
        $scope.item_cache.items = {};
      $scope.item_cache.items[$stateParams.id] = $scope.item;

      $ionicSlideBoxDelegate.update();
      initialize();
      $timeout(function () {
        $ionicLoading.hide();
      }, 500);
    });

    $scope.openRingSizeGuide = function () {

      $ionicPopup.alert({
        title: "Ring Size Guide",
        templateUrl: 'templates/popups/size_guide.html',
        scope: $scope
      });

      ShopService.GetRingSizeImage().then(function (data) {
        if (data && data.banners && data.banners[0])
          $scope.item_cache.ringSizeUrl = data.banners[0].image;
      });
    }

    $scope.buyNow = function () {
      // add to cart and checkout
      if ($scope.shop.shopItemForm.$invalid) {
        $ionicPopup.alert({
          title: locale.getString('shop.select_following_options'),
          templateUrl: "app/shop/templates/popups/missing-props.html",
          scope: $scope,
          buttons: [
            {
              text: 'OK',
              type: 'button-positive'
            }
          ]
        });
      } else {
        $ionicLoading.show();

        CartService.AddToCart($stateParams.id, $scope.cart.quantity, $scope.cart.options).then(function (data) {
          $rootScope.cartItemCount = $rootScope.cartItemCount || 0;
          $rootScope.cartItemCount += parseInt($scope.cart.quantity);
          $ionicTabsDelegate.select(2);
          $state.go('app.menu.cart.home', {}, {reload: true});
          $ionicLoading.hide();
        }, function (error) {
          alert("Error. Can't add to the cart");
          $ionicLoading.hide();
        });
      }
    }

    $scope.addToCart = function () {
      if ($scope.shop.shopItemForm.$invalid) {
        $ionicPopup.alert({
          title: 'Oops!',
          templateUrl: "app/shop/templates/popups/missing-props.html",
          scope: $scope,
          buttons: [
            {
              text: 'OK',
              type: 'button-positive'
            }
          ]
        });
      } else {

        // show alert regardless Add to cart confirmation
        var alertPopup = $ionicPopup.alert({
          title: locale.getString('shop.added_to_cart'),
          cssClass: 'desc-popup',
          template: "{{ 'shop.item_added_to_cart' | i18n}}",
          buttons: [
            {text: locale.getString('shop.show_more')},
            {
              text: locale.getString('shop.go_to_cart'),
              type: 'button-positive',
              onTap: function (e) {
                $ionicTabsDelegate.select(2);
                $state.go('app.menu.cart.home', {}, {reload: true});
              }
            }
          ]
        });

        CartService.AddToCart($stateParams.id, $scope.cart.quantity, $scope.cart.options).then(function (data) {
          $rootScope.cartItemCount = $rootScope.cartItemCount || 0;
          $rootScope.cartItemCount += parseInt($scope.cart.quantity);
        }, function (error) {
          alertPopup.close();
          alert(locale.getString('shop.error'));
        });
      }
    }

    $scope.share = function () {
      var link = WEBSITE + "/index.php?route=product/product&product_id=" + $stateParams.id;
      window.plugins.socialsharing.share($scope.name, $scope.name, null, link);
    }

    $scope.range = function (min, max, step) {
      step = step || 1;
      min = min || 1;
      max = max || 10;
      min = parseInt(min);
      var input = [];
      for (var i = min; i <= max; i += step) {
        input.push(i);
      }

      return input;
    };

    $scope.selectableOptions = function (item) {
      return item.type === 'radio' || item.type === 'select';
    }

    $scope.multipleOptions = function (item) {
      return item.type === 'checkbox';
    }

    $scope.textOptions = function (item) {
      return item.type === 'text' || item.type === 'date' || item.type === 'time';
    }

    $scope.fileOptions = function (item) {
      return item.type === 'file';
    }

    $scope.datetimeOptions = function (item) {
      return item.type === 'datetime';
    }

    $scope.textareaOptions = function (item) {
      return item.type === 'textarea';
    }
  });


/**
 * @ngdoc controller
 * @name shop.module.controller:ShopCategoryCtrl
 * @requires $scope
 * @requires $rootScope
 * @requires $stateParams
 * @requires $state
 * @requires ShopService
 * @description
 * Lists products of a selected category.
 */
angular
  .module('shop.module')
  .controller('ShopCategoryCtrl', function ($scope, $rootScope, $stateParams, $state, ShopService) {
    var vm = this;

    $scope.id = $stateParams.id;

    if (!$stateParams.id) {
      $state.go('app.menu.shop.home');
    }

    $scope.endOfItems = false;
    $scope.loadingItems = false;
    $scope.page = 1;

    $scope.refreshUI = function () {
      $scope.endOfItems = false;
      $scope.items = [];
      $scope.page = 1;
      $scope.loadItems();
    }

    $scope.loadItems = function () {
      if ($scope.loadingItems) {
        return;
      }

      $scope.loadingItems = true;
      $scope.items = $scope.items || [];

      ShopService.GetCategoryProducts($stateParams.id, $scope.page).then(function (data) {
        $scope.items = $scope.items.concat(data.products);
        $scope.category_name = data.heading_title;
        $scope.text_empty = data.text_empty;
        $scope.page++;
        if (data && data.products.length < 1)
          $scope.endOfItems = true;
        $scope.loadingItems = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.$broadcast('scroll.refreshComplete');
      }, function (data) {
        $scope.loadingItems = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    $scope.loadNextPage = function () {
      if (!$scope.endOfItems) {
        $scope.loadItems();
      } else {
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.$broadcast('scroll.refreshComplete');
      }
    }
  });

angular
  .module('shop.module')
  .controller('ShopUserProductCtrl', function ($scope, $rootScope, $stateParams, ShopService) {
    $scope.page = 1;
    $scope.endOfItems = true;
    $scope.loadingItems = false;

    $scope.items = [];

    $scope.badges = [];

    $scope.loadItems = function () {
      if ($scope.loadingItems) {
        return;
      }

      $scope.loadingItems = true;
      $scope.items = $scope.items || [];


      ShopService.GetProductsByUserId($stateParams.id, $scope.page).then(function (data) {
        $scope.items = $scope.items.concat(data.products);
        if ($scope.user_info == undefined) {
          $scope.user_info = data.user_info;

          $scope.badges.push(data.user_info.badge1);
          $scope.badges.push(data.user_info.badge2);
          $scope.badges.push(data.user_info.badge3);
          $scope.badges.push(data.user_info.badge4);
          $scope.badges.push(data.user_info.badge5);

        }
        $scope.text_empty = data.text_empty;
        // $ionicScrollDelegate.resize();
        $scope.page++;
        console.log("From page: " + $scope.page);
        if (data.products.length < 1)
          $scope.endOfItems = true;
        else
          $scope.endOfItems = false;
        $scope.loadingItems = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }, function (data) {
        $scope.loadingItems = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });

    }
    $scope.loadItems();

    $scope.loadNextPage = function () {
      if (!$scope.endOfItems) {
        $scope.loadItems();
      } else {
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.$broadcast('scroll.refreshComplete');
      }
    }


  })


/**
 * @ngdoc controller
 * @name shop.module.controller:ShopSearchCtrl
 * @requires $scope
 * @requires $rootScope
 * @requires $ionicScrollDelegate
 * @requires $stateParams
 * @requires ShopService
 * @description
 * Search page shows a search input box and filters the product catalog for the customer entered
 * keywords.
 */
angular
  .module('shop.module')
  .controller('ShopSearchCtrl', function ($scope, $timeout, $localStorage, $rootScope, $state, $cordovaGeolocation, $stateParams, $ionicPopup, $ionicLoading, $ionicTabsDelegate, $ionicSlideBoxDelegate, $compile, locale, ShopService) {

    $scope.init = function () {

      var myLatlng = new google.maps.LatLng(21.012187, 105.806705);
      var locations = [];
      var marker, i;
      var listlocationsbycat = [];
      var infowindow = new google.maps.InfoWindow();


      $scope.mypos = {};

      var mapOptions = {
        center: myLatlng,
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      var map = new google.maps.Map(document.getElementById("map"),
        mapOptions);

      $scope.store = [];


      console.log('Before Navigator geolocation');
      //Get current Position
      navigator.geolocation.getCurrentPosition(function (position) {
        console.log('navigator.geolocation');
        $scope.mylat = position.coords.latitude;
        $scope.mylng = position.coords.longitude;

        //Shop Service get All User Information.
        ShopService.LoadAllUsers($scope.mylat, $scope.mylng).then(function (data) {

          var tes=[];
          data.users.forEach(function (element) {
            tes.push([element.company, element.latitude, element.longitude, element.address, element.user_id, element.category_id, element.category_name, element.user_id, element.fullname]);
          });
locations = tes.slice();
          // locations = data.users;

          // console.log('Loca' +locations[0].company);
          console.log(locations);
          // console.log(data.users[1].company);
          // console.log(data.users[1].category_name);
          // $scope.store = data.users;
          // $scope.dat = data.users;
          $scope.dat = JSON.parse(JSON.stringify(data.users));
          // $scope.store = JSON.parse(JSON.stringify(data.users));


          //check if $scope.dat has duplicated value if not then add object to $scope.store
          angular.forEach($scope.dat, function(value, key) {
            var exists = false;
            angular.forEach($scope.store, function(val2, key) {
              if(angular.equals(value.user_id, val2.user_id)){ exists = true };
            });
            if(exists == false && value.user_id != "") { $scope.store.push(value); }
          });

          //===================

          console.log('Comparing ');
          console.log($scope.store === $scope.dat);
          console.log('Load all users and get locations '+ locations.length);



          if (navigator.geolocation) {
            console.log(navigator.geolocation);
            console.log('If navigator.geolocation');
            navigator.geolocation.getCurrentPosition(function (position) {
              var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };


              var image = {
                url: 'http://24gocheck.com/image/catalog/24gocheck%20Icons/bluemarker.png', // image is 512 x 512
                scaledSize: new google.maps.Size(36, 36)
              };

              var marker = new google.maps.Marker({
                position: pos,
                draggable: true,
                animation: google.maps.Animation.DROP,
                icon: image,
                map: map,
                title: locale.getString('shop.my_location')
              });
              marker.addListener('click', toggleBounce);

              function toggleBounce() {
                if (marker.getAnimation() !== null) {
                  marker.setAnimation(null);
                } else {
                  marker.setAnimation(google.maps.Animation.BOUNCE);
                }
              }

              var request = {
                location: pos,
                radius: 5000,
                type: ['restaurant']
              };

              var service = new google.maps.places.PlacesService(map);
              console.log('Call me?');
              service.nearbySearch(request, callback);

              marker.addListener('click', function () {
                map.setZoom(14);
                var circle = new google.maps.Circle({
                  center: pos,
                  // radius: position.coords.accuracy,
                  radius: 1500,
                  map: map,
                  fillColor: '#78b5f6',
                  fillOpacity: 0.5,
                  strokeColor: '#78b5f6',
                  strokeOpacity: 1.0
                });
                map.fitBounds(circle.getBounds());
                map.setCenter(marker.getPosition());
              });

              infowindow.setPosition(pos);
              infowindow.setContent(locale.getString('shop.my_location'));
              infowindow.open(map, marker);
              map.setCenter(pos);

            }, function () {
              handleLocationError(true, infowindow, map.getCenter());
            });
          } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infowindow, map.getCenter());
          } //end Get myPosition.
        }, function (data) {
          // $ionicLoading.hide();
        });
      }, function () {

      });


      // //Shop Service get All User Information.
      // ShopService.LoadAllUsers(21.012187, 105.806705).then(function (data) {
      //   data.users.forEach(function(element){
      //     locations.push([element.company, element.latitude, element.longitude]);
      //   });
      //   // console.log(data.users[1].company);
      //   // console.log(data.users[1].address_1);
      //   $scope.testlocation = data.users;
      //
      // }, function (data) {
      //   // $ionicLoading.hide();
      // });


      //Callback function in NearbySearch Service:
      function callback() {
        console.log('Callback called');
        var image = {
          url: 'http://24gocheck.com/image/catalog/24gocheck%20Icons/greenmarker.png',
          scaledSize: new google.maps.Size(40, 40)
        };

        console.log('Locations '+locations.length);
        for (i = 0; i < locations.length; i++) {
          var category = locations[i][5];

          marker = new google.maps.Marker({
            position: new google.maps.LatLng(locations[i][1], locations[i][2]),
            map: map,
            category: category,
            icon: image,
            title: locations[i][0]
          });

          listlocationsbycat.push(marker);

          google.maps.event.addListener(marker, 'click', (function (marker, i) {
            return function () {
              map.setZoom(14);
              map.setCenter(marker.getPosition());
              // infowindow.setContent("<strong style='overflow: hidden; text-overflow: ellipsis; white-space: nowrap;'>" + locations[i][0] + "</strong>");
              infowindow.setContent('<div><strong>' + 'Place: ' + (locations[i][0] ? locations[i][0] : locations[i][8]) + '</strong><br>' +
                'Place ID: ' + locations[i][4] + '<br>' +
                'User ID: ' + locations[i][7] + '<br>' +
                locations[i][3] + '<br>' + 'Category: ' + locations[i][6] + '</div>');
              infowindow.open(map, marker);
            }
          })(marker, i));
        }
      } //end callback Function.



      //Get MyPosition.
      // if (navigator.geolocation) {
      //   console.log(navigator.geolocation);
      //   console.log('If navigator.geolocation');
      //   navigator.geolocation.getCurrentPosition(function (position) {
      //     var pos = {
      //       lat: position.coords.latitude,
      //       lng: position.coords.longitude
      //     };
      //
      //
      //     var image = {
      //       url: 'http://24gocheck.com/image/catalog/24gocheck%20Icons/bluemarker.png', // image is 512 x 512
      //       scaledSize: new google.maps.Size(36, 36)
      //     };
      //
      //     var marker = new google.maps.Marker({
      //       position: pos,
      //       draggable: true,
      //       animation: google.maps.Animation.DROP,
      //       icon: image,
      //       map: map,
      //       title: locale.getString('shop.my_location')
      //     });
      //     marker.addListener('click', toggleBounce);
      //
      //     function toggleBounce() {
      //       if (marker.getAnimation() !== null) {
      //         marker.setAnimation(null);
      //       } else {
      //         marker.setAnimation(google.maps.Animation.BOUNCE);
      //       }
      //     }
      //
      //     var request = {
      //       location: pos,
      //       radius: 5000,
      //       type: ['restaurant']
      //     };
      //
      //     var service = new google.maps.places.PlacesService(map);
      //     console.log('Call me?');
      //     service.nearbySearch(request, callback);
      //
      //     marker.addListener('click', function () {
      //       map.setZoom(14);
      //       var circle = new google.maps.Circle({
      //         center: pos,
      //         // radius: position.coords.accuracy,
      //         radius: 1500,
      //         map: map,
      //         fillColor: '#78b5f6',
      //         fillOpacity: 0.5,
      //         strokeColor: '#78b5f6',
      //         strokeOpacity: 1.0
      //       });
      //       map.fitBounds(circle.getBounds());
      //       map.setCenter(marker.getPosition());
      //     });
      //
      //     infowindow.setPosition(pos);
      //     infowindow.setContent(locale.getString('shop.my_location'));
      //     infowindow.open(map, marker);
      //     map.setCenter(pos);
      //
      //   }, function () {
      //     handleLocationError(true, infowindow, map.getCenter());
      //   });
      // } else {
      //   // Browser doesn't support Geolocation
      //   handleLocationError(false, infowindow, map.getCenter());
      // } //end Get myPosition.


      $scope.filterMarkers = function (category) {
        for (i = 0; i < locations.length; i++) {
          marker = listlocationsbycat[i];
          // If is same category or category not picked
          if (marker.category == category || category.length === 0) {
            marker.setVisible(true);
          }
          // Categories don't match
          else {
            marker.setVisible(false);
          }
        }
      }

      $scope.filterbyCategories = function (category_id) {
        $scope.store = [];
        for(i=0; i < $scope.dat.length; i++) {
          if($scope.dat[i].category_id == category_id){
            $scope.store.push($scope.dat[i]);
          }
        }
        // console.log($scope.dat);
      }

      $scope.map = map;

      // $scope.locations = locations;


    }

    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
      infoWindow.setPosition(pos);
      infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
      infoWindow.open(map);
    }

    function drop() {
      for (var i = 0; i < markerArray.length; i++) {
        setTimeout(function () {
          addMarkerMethod();
        }, i * 200);
      }
    }


    // $scope.init = function () {
    //   var myLatlng = new google.maps.LatLng(21.012187, 105.806705);
    //
    //   var mapOptions = {
    //     center: myLatlng,
    //     zoom: 15,
    //     mapTypeId: google.maps.MapTypeId.ROADMAP
    //   };
    //   var map = new google.maps.Map(document.getElementById("map"),
    //     mapOptions);
    //   var infowindow = new google.maps.InfoWindow();
    //
    //   //Search Nearby
    //   var request = {
    //     location: myLatlng,
    //     radius: 5000,
    //     type: ['restaurant']
    //   };
    //
    //   var locations = [];
    //   var marker, i;
    //
    //   ShopService.LoadAllUsers().then(function (data) {
    //     data.users.forEach(function(element){
    //       locations.push([element.company, element.latitude, element.longitude]);
    //     });
    //     console.log(data.users[0].company);
    //     console.log(data.users[0].latitude);
    //     console.log(data.users[0].longitude);
    //   }, function (data) {
    //     // $ionicLoading.hide();
    //   });
    //
    //   var service = new google.maps.places.PlacesService(map);
    //   service.nearbySearch(request, callback);
    //
    //   function callback() {
    //     for (i = 0; i < locations.length; i++) {
    //       marker = new google.maps.Marker({
    //         position: new google.maps.LatLng(locations[i][1], locations[i][2]),
    //         map: map,
    //         title: locations[i][0]
    //       });
    //
    //       google.maps.event.addListener(marker, 'click', (function(marker, i) {
    //         return function() {
    //           infowindow.setContent(locations[i][0]);
    //           infowindow.open(map, marker);
    //         }
    //       })(marker, i));
    //     }
    //   }
    //
    //   $scope.map = map;
    //
    // }


    // $scope.users = [];


    $scope.selectedCat = "1";
    $scope.selectedZone = "3776";
    $scope.page = 1;
    $scope.cates = [];
    $scope.endOfItems = true;
    $scope.loadingItems = false;
    $scope.picked = '';


    $scope.items = [];
    ShopService.GetCategories().then(function (data) {

      $scope.cates = data.categories;


      // $ionicLoading.hide();
    }, function (data) {
      // $ionicLoading.hide();
    });


    //==================================================================================================================

    $rootScope.checking = false;


    $scope.pickedOption = function (aString) {
      $scope.picked = aString;
    }
    //==================================================================================================================

    $scope.changeCategory = function (selectedCat) {
      $scope.selectedCat = selectedCat;
      if ($scope.loadingItems) {
        return;
      }

      $scope.loadingItems = true;
      $scope.items = $scope.items || [];

      console.log('Shika Page ' + $scope.page);

      console.log('Selected Cate' + selectedCat);
      ShopService.SearchProductsByCategoryId(selectedCat, $scope.page).then(function (data) {
        $scope.items = $scope.items.concat(data.products);
        $scope.text_empty = data.text_empty;

        // $ionicScrollDelegate.resize();
        $scope.page++;
        if (data.products.length < 1)
          $scope.endOfItems = true;
        else
          $scope.endOfItems = false;
        $scope.loadingItems = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }, function (data) {
        $scope.loadingItems = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });

    }
    $scope.loadNextPage = function () {
      if (!$scope.endOfItems) {
        if ($scope.picked == 'category') {
          $scope.changeCategory($scope.selectedCat);
        } else if ($scope.picked == 'city') {
          $scope.changeZone($scope.selectedZone);
        }
      } else {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }
    }

    $scope.changeZone = function (selectedZone) {

      $scope.selectedZone = selectedZone;
      if ($scope.loadingItems) {
        return;
      }

      $scope.loadingItems = true;
      $scope.items = $scope.items || [];


      console.log('Selected Zone' + selectedZone);


      ShopService.SearchProductsByZoneId(selectedZone, $scope.page).then(function (data) {
        $scope.items = $scope.items.concat(data.products);
        $scope.text_empty = data.text_empty;

        // $ionicScrollDelegate.resize();
        $scope.page++;
        if (data.products.length < 1)
          $scope.endOfItems = true;
        else
          $scope.endOfItems = false;
        $scope.loadingItems = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }, function (data) {
        $scope.loadingItems = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    }


    $scope.resetOption = function () {
      $scope.items = [];
      $scope.page = 1;
      $scope.endOfItems = true;
      $scope.loadingItems = false;
      $scope.selectedCat = "1";
      $scope.selectedZone = "1";
    }


  });

angular
  .module('shop.module')
  .controller('FilterCtrl', function ($scope, $rootScope, $ionicScrollDelegate, $stateParams, ShopService) {
    $scope.filter = 'Xu hướng';

  });

angular
  .module('shop.module')
  .controller('ShopPromotionCtrl', function ($scope, $localStorage, $rootScope, $stateParams, $ionicSlideBoxDelegate, ShopService) {

    var vm = this;
    $scope.endOfRLatestItems = false;
    $scope.loadingLatest = false;

    // sync form input to localstorage
    $localStorage.home = $localStorage.home || {};
    $scope.data = $localStorage.home;
    $scope.data.latestPage = 1;

    if (!$scope.data.slides)
      $scope.data.slides = [{image: "app/shop/images/introcompany.png"}];

    $scope.refreshUI = function () {
      $scope.data.latestPage = 1;
      $scope.endOfRLatestItems = false;
      $scope.loadLatest(true);
      $scope.loadFeatured();
      //$scope.loadCategories();
      $scope.loadBanners();
    }

    $scope.loadBanners = function () {
      ShopService.GetBanners().then(function (data) {
        $scope.data.slides = data.main_banners;
        $scope.data.offers = data.offer_banner;
        $ionicSlideBoxDelegate.update();
      });
    }

    $scope.loadFeatured = function () {
      ShopService.GetFeaturedProducts().then(function (data) {
        $scope.data.featuredItems = data.products;
        $ionicSlideBoxDelegate.update();
      });
    }

    $scope.loadLatest = function (refresh) {
      if ($scope.loadingLatest) {
        return;
      }

      $scope.loadingLatest = true;
      $scope.data.latestItems = $scope.data.latestItems || [];

      ShopService.GetLatestProducts($scope.data.latestPage).then(function (data) {
        if (refresh) {
          $scope.data.latestItems = data.products;
          $scope.data.latestPage = 1;
        } else {
          if ($scope.data.latestPage == 1) {
            $scope.data.latestItems = [];
          }

          $scope.data.latestItems = $scope.data.latestItems.concat(data.products);
          $scope.data.latestPage++;
        }
        if (data.products && data.products.length < 1)
          $scope.endOfRLatestItems = true;
        $scope.loadingLatest = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.$broadcast('scroll.refreshComplete');
      }, function (data) {
        $scope.loadingLatest = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    $scope.loadNextRecentPage = function () {
      if (!$scope.endOfRLatestItems) {
        $scope.loadLatest();
      } else {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }
    }

    $scope.$on('$ionicView.enter', function () {
      $ionicSlideBoxDelegate.update();
    });

    $scope.$on('i2csmobile.shop.refresh', function () {
      $scope.refreshUI();
    });

    $scope.loadFeatured();
    $scope.loadBanners();


  });


angular
  .module('shop.module')
  // .controller('OffersTopCtrl', function ($scope, $localStorage, $rootScope, $stateParams, $ionicSlideBoxDelegate, ShopService) {
  .controller('OffersTopCtrl', function ($scope, $timeout, $localStorage, $rootScope, $state, $cordovaGeolocation, $stateParams, $ionicPopup, $ionicLoading, $ionicTabsDelegate, $ionicSlideBoxDelegate, $compile, locale, ShopService, CartService, WEBSITE) {

    var vm = this;
    $scope.endOfRLatestItems = false;
    $scope.loadingLatest = false;

    // sync form input to localstorage
    $localStorage.home = $localStorage.home || {};
    $scope.data = $localStorage.home;
    $scope.data.latestPage = 1;

    if (!$scope.data.slides)
      $scope.data.slides = [{image: "app/shop/images/introcompany.png"}];

    $scope.refreshUI = function () {
      $scope.data.latestPage = 1;
      $scope.endOfRLatestItems = false;
      $scope.loadLatest(true);
      $scope.loadFeatured();
      //$scope.loadCategories();
      $scope.loadBanners();
    }

    $scope.loadBanners = function () {
      ShopService.GetBanners().then(function (data) {
        $scope.data.slides = data.main_banners;
        $scope.data.offers = data.offer_banner;
        $ionicSlideBoxDelegate.update();
      });
    }

    $scope.loadFeatured = function () {
      ShopService.GetFeaturedProducts().then(function (data) {
        $scope.data.featuredItems = data.products;
        $ionicSlideBoxDelegate.update();
      });
    }

    $scope.loadLatest = function (refresh) {
      if ($scope.loadingLatest) {
        return;
      }

      $scope.loadingLatest = true;
      $scope.data.latestItems = $scope.data.latestItems || [];

      ShopService.GetLatestProducts($scope.data.latestPage).then(function (data) {
        if (refresh) {
          $scope.data.latestItems = data.products;
          $scope.data.latestPage = 1;
        } else {
          if ($scope.data.latestPage == 1) {
            $scope.data.latestItems = [];
          }

          $scope.data.latestItems = $scope.data.latestItems.concat(data.products);
          $scope.data.latestPage++;
        }
        if (data.products && data.products.length < 1)
          $scope.endOfRLatestItems = true;
        $scope.loadingLatest = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.$broadcast('scroll.refreshComplete');
      }, function (data) {
        $scope.loadingLatest = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    $scope.loadNextRecentPage = function () {
      if (!$scope.endOfRLatestItems) {
        $scope.loadLatest();
      } else {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }
    }

    $scope.$on('$ionicView.enter', function () {
      $ionicSlideBoxDelegate.update();
    });

    $scope.$on('i2csmobile.shop.refresh', function () {
      $scope.refreshUI();
    });

    $scope.loadFeatured();
    $scope.loadBanners();


  });


angular
  .module('shop.module')
  .controller('OffersTrendCtrl', function ($scope, $localStorage, $rootScope, $stateParams, $ionicSlideBoxDelegate, ShopService) {
    // $scope.navTitle='<img class="title-image" src="images/24gocheck.png" />';
    $scope.navTitle = '<img class="title-image" src="images/24gocheck.png" />';
    // $scope.shop = {};
    // $scope.shop.shopName = "Công ty AlVietJS";
    // $scope.shop.location = " 169 Nguyễn Ngọc Vũ, P.Trung Hòa";
    // $scope.shop.price = "1000000000 đ";
    // $scope.shop.phone = "123456";
    // $scope.shop.rating = 3;
    // $scope.shop.likes = "85";


    var vm = this;
    $scope.endOfRLatestItems = false;
    $scope.loadingLatest = false;

    // sync form input to localstorage
    $localStorage.home = $localStorage.home || {};
    $scope.data = $localStorage.home;
    $scope.data.latestPage = 1;

    if (!$scope.data.slides)
      $scope.data.slides = [{image: "app/shop/images/introcompany.png"}];

    $scope.refreshUI = function () {
      $scope.data.latestPage = 1;
      $scope.endOfRLatestItems = false;
      $scope.loadLatest(true);
      $scope.loadFeatured();
      //$scope.loadCategories();
      $scope.loadBanners();
    }

    $scope.loadBanners = function () {
      ShopService.GetBanners().then(function (data) {
        $scope.data.slides = data.main_banners;
        $scope.data.offers = data.offer_banner;
        $ionicSlideBoxDelegate.update();
      });
    }

    $scope.loadFeatured = function () {
      ShopService.GetFeaturedProducts().then(function (data) {
        $scope.data.featuredItems = data.products;
        $ionicSlideBoxDelegate.update();
      });
    }

    $scope.loadLatest = function (refresh) {
      if ($scope.loadingLatest) {
        return;
      }

      $scope.loadingLatest = true;
      $scope.data.latestItems = $scope.data.latestItems || [];

      ShopService.GetLatestProducts($scope.data.latestPage).then(function (data) {
        if (refresh) {
          $scope.data.latestItems = data.products;
          $scope.data.latestPage = 1;
        } else {
          if ($scope.data.latestPage == 1) {
            $scope.data.latestItems = [];
          }

          $scope.data.latestItems = $scope.data.latestItems.concat(data.products);
          $scope.data.latestPage++;
        }
        if (data.products && data.products.length < 1)
          $scope.endOfRLatestItems = true;
        $scope.loadingLatest = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.$broadcast('scroll.refreshComplete');
      }, function (data) {
        $scope.loadingLatest = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    $scope.loadNextRecentPage = function () {
      if (!$scope.endOfRLatestItems) {
        $scope.loadLatest();
      } else {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }
    }

    $scope.$on('$ionicView.enter', function () {
      $ionicSlideBoxDelegate.update();
    });

    $scope.$on('i2csmobile.shop.refresh', function () {
      $scope.refreshUI();
    });

    $scope.loadFeatured();
    $scope.loadBanners();


  });




