var PAGE_LIMIT = 20;
var PAGING_DISPLAY_MAX = 10;
var ALL_DATA = new Array();

var angularmodule = angular.module('angularmodule', [ 'ui.bootstrap',
		'ngResource' ]);

// カレンダー
angularmodule.controller('DatePickerController', function($scope) {
	$scope.date = new Date();
	$scope.datePickerOpen = false;
	$scope.toggleDatePicker = function($event) {
		$event.stopPropagation();

		$scope.datePickerOpen = !$scope.datePickerOpen;
	};
}).config(function(datepickerConfig, datepickerPopupConfig) {
	angular.extend(datepickerConfig, {
		showWeeks : false,
		formatDay : 'd'
	});

	angular.extend(datepickerPopupConfig, {
		currentText : '今日',
		clearText : 'クリア',
		closeText : '閉じる'
	});
});

// ダイアログ
angularmodule.controller('ModalController', function($scope, $modal) {

	$scope.animationsEnabled = true;

	$scope.open = function(id) {
		var modalInstance = $modal.open({
			animation : $scope.animationsEnabled,
			templateUrl : 'myModalContent.html',
			controller : 'ModalInstanceController',
			resolve : {
				id: function() {
					return id
				}
			}
		});
	};

});
angularmodule.controller('ModalInstanceController', function($scope, $modalInstance, id) {

	// 選択されたユーザーIDを元にユーザー情報を取得
	for(var i = 0; i  < ALL_DATA.length; i++) {
		var user = ALL_DATA[i].user;
		if(user.id == id) {
			$scope.userId = user.id;
			$scope.name = user.name;
			$scope.kana = user.kana;
			$scope.zipCode = "郵便番号情報がありません";
			$scope.address = user.address;
			$scope.phoneNumber = user.phoneNumber;
			$scope.mailAddress = user.mailAddress;
			$scope.details = "ユーザーさんの詳細情報はありません";
			break;
		}
	}

	$scope.ok = function() {
		$modalInstance.close();
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
});

var getTableData = function(currentPage) {
	// 表示するデータの開始位置・終了位置を決定
	var sIndex = PAGE_LIMIT * (currentPage - 1);
	var eIndex = sIndex + PAGE_LIMIT;

	// 表示するデータをコピー
	var userList = new Array();
	for (var i = sIndex; i < eIndex; i++) {
		userList.push(ALL_DATA[i]);
	}

	return userList;
};

// データ読み込み
angularmodule.controller('TableController', function UserController($scope, $resource, $filter) {
	$scope.userList = null;

	$scope.getUserList = function() {
		$resource("data/userlist.json").get(function(data) {
			// 読み込んだデータを保持しておく
			ALL_DATA = data.userList;

			// 初期値が設定されていなければ1を設定
			if($scope.currentPage == null) {
				$scope.currentPage = 1;
			}

			// 初期設定
			$scope.itemsPerPage = PAGE_LIMIT;
			$scope.totalItems = ALL_DATA.length;
			$scope.maxSize = PAGING_DISPLAY_MAX;
			$scope.userList = getTableData($scope.currentPage);
			$scope.sort = {
				column: "user.id",
				descending: false
			};
		});
	};

	$scope.pageChanged = function() {
		// データをソート
		ALL_DATA = $filter('orderBy')(ALL_DATA, $scope.sort.column, $scope.sort.descending);

		$scope.userList = getTableData($scope.currentPage);
	};

	$scope.changeSorting = function(column) {
		var sort = $scope.sort;
		if (sort.column == column) {
			sort.descending = !sort.descending;
		} else {
			sort.column = column;
		    sort.descending = false;
		}

		// データをソート
		ALL_DATA = $filter('orderBy')(ALL_DATA, $scope.sort.column, $scope.sort.descending);

		$scope.userList = getTableData($scope.currentPage);
    };
});

