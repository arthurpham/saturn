module Saturn.OptionView {

    export class Directive implements ng.IDirective {
        public controller = "saturn.optionView.controller";
        public restrict = "E";
        public templateUrl = "src/optionView/template.html";
        public scope = {
            columns: "=",
            data: "=",
            title: "@"
        };

        public link = ($scope: Saturn.OptionView.IScope, element: JQuery) => {
            var tableElement = element.find(".main-table");

            $scope.data.then((d) => {
                $scope.dataTable = this.createTable(tableElement, d, $scope.columns);
            });

            tableElement.on("init.dt", () => {
                    $scope.dataLoaded = true;
            });

            this.initNumericFilters($scope);
            this.initSelection($scope, tableElement);
        };

        private createTable(tableElement: JQuery, data: any, columns: any[]) {
            var initOptions: any = {
                data: data,
                columns: columns,
                dom: "ftipr",
                processing: true
            };

            return tableElement.dataTable(initOptions);
        }

        private initNumericFilters($scope: IScope) {

            $scope.numericColumns = [];
            for (var i = 0; i < $scope.columns.length; i++) {
                var col = $scope.columns[i];
                if (col.type !== IColumnType.NUMERIC) {
                    continue;
                }
                $scope.numericColumns.push({ min: col.defaultMin, max: col.defaultMax, index: i, title: col.title });
            };

            $.fn.dataTable.ext.search.push((settings: any, data: any, dataIndex: any) => {
                for (var i = 0; i < $scope.numericColumns.length; i++) {
                    var col = $scope.numericColumns[i];
                    var datum = parseFloat(data[col.index]) || undefined;

                    if (col.min !== null && !isNaN(col.min) && (datum === undefined || datum < col.min)) {
                        return false;
                    }
                    if (col.max !== null && !isNaN(col.max) && (datum === undefined || datum > col.max)) {
                        return false;
                    }
                }
                return true;
            });

            $scope.$watch("numericColumns", () => {
                if ($scope.dataTable) {
                    $scope.dataTable.fnDraw();
                }
            }, true);
        }

        private initSelection($scope: IScope, tableElement: JQuery) {
            tableElement.on("click", "tr", (event: JQueryEventObject) => {
                var currentRowElement = $(event.currentTarget);

                if (currentRowElement.hasClass("selected")) {
                    $scope.dataTable.$("tr.selected").removeClass("selected");

                    $scope.$apply(() => {
                        $scope.updateSelectedOptionDetails(null);
                    });
                } else {
                    $scope.dataTable.$("tr.selected").removeClass("selected");

                    var selectedIndex = $scope.dataTable.fnGetPosition(currentRowElement[0]);
                    if (selectedIndex) {
                        var node = $scope.dataTable.fnGetNodes(selectedIndex);
                        $(node).addClass("selected");
                        $scope.$apply(() => {
                            $scope.updateSelectedOptionDetails($scope.dataTable._("tr.selected")[0].option.underlying.symbol);
                        });
                    }
                }
            });
        }
    }
    directives.directive("saturn.optionView.directive", () => new Saturn.OptionView.Directive());
}