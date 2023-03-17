class PolarChartElement extends HTMLElement {
  constructor() {
    super()
  }
  connectedCallback() {
    if (window.am5) {
      this._init()
    }
  }

  disconnectedCallback() {

  }

  _init() {
    this._initChart()
  }

  _initChart() {
    var self = this;
    // Check if amchart library is included
    if (typeof am5 === "undefined") {
      return;
    }

    // attributes

    var attributes = this._getAttributes();

    var id = attributes.id || 'polar-chart'
    var data = attributes.data && JSON.parse(attributes.data) || {}


    var element = document.querySelector('#' + id);

    if (!element) {
      return;
    }

    var root;

    var init = function () {
      // Create root element
      // https://www.amcharts.com/docs/v5/getting-started/#Root_element
      root = am5.Root.new(element);

      if (!root) {
        return;
      }

      // Set themes
      // https://www.amcharts.com/docs/v5/concepts/themes/
      root.setThemes([am5themes_Animated.new(root)]);

      // Create chart
      // https://www.amcharts.com/docs/v5/charts/radar-chart/
      var chart = root.container.children.push(
        am5radar.RadarChart.new(root, {
          panX: false,
          panY: false,
          wheelX: "panX",
          wheelY: "zoomX",
        })
      );

      // Create axes and their renderers
      // https://www.amcharts.com/docs/v5/charts/radar-chart/#Adding_axes
      var xRenderer = am5radar.AxisRendererCircular.new(root, {});
      xRenderer.labels.template.setAll({
        radius: 10
      });

      xRenderer.grid.template.setAll({
        stroke: am5.color(self._getCssVariableValue("--bs-gray-700"))
      });

      var yRenderer = am5radar.AxisRendererRadial.new(root, {
        minGridDistance: 20
      });

      yRenderer.grid.template.setAll({
        stroke: am5.color(self._getCssVariableValue("--bs-gray-700"))
      });

      var xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          maxDeviation: 0,
          categoryField: "category",
          renderer: xRenderer,
          tooltip: am5.Tooltip.new(root, {}),
        })
      );

      var yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          min: 0,
          max: 10,
          renderer: yRenderer
        })
      );

      xRenderer.labels.template.setAll({
        fontSize: 11,
        fill: am5.color(self._getCssVariableValue("--bs-gray-800")),
      });

      yRenderer.labels.template.setAll({
        fontSize: 11,
        fill: am5.color(self._getCssVariableValue("--bs-gray-800")),
      });

      //yAxis.get("renderer").labels.template.set("forceHidden", true);

      // Create series
      // https://www.amcharts.com/docs/v5/charts/radar-chart/#Adding_series
      var series = chart.series.push(
        am5radar.RadarColumnSeries.new(root, {
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "value",
          categoryXField: "category",
        })
      );

      series.columns.template.setAll({
        tooltipText: "{categoryX}: {valueY}",
        templateField: "columnSettings",
        strokeOpacity: 0,
        width: am5.p100,
      });

      // Set data
      // https://www.amcharts.com/docs/v5/charts/radar-chart/#Setting_data

      var dataFormat = []
      Object.keys(data).map(function (key) {
        dataFormat.push({
          category: key,
          value: data[key].value,
          columnSettings: {
            fill: chart.get("colors").next(),
          },
        })
      })

      series.data.setAll(dataFormat);
      xAxis.data.setAll(dataFormat);

      // Animate chart
      // https://www.amcharts.com/docs/v5/concepts/animations/#Initial_animation
      series.appear(1000);
      chart.appear(1000, 100);
    }

    // On amchart ready
    am5.ready(function () {
      init();
    }); // end am5.ready()
  }

  _getAttributes() {
    let config = {}

    for (let i = 0; i < this.attributes.length; i++) {
      config[this.attributes[i].name] = this.attributes[i].value
    }

    // console.log(config);
    return config
  }


  _getCssVariableValue(variableName) {
    let hex = getComputedStyle(document.documentElement).getPropertyValue(variableName);
    if (hex && hex.length > 0) {
      hex = hex.trim();
    }
    return hex;
  }

}

if (window.customElements && !window.customElements.get('polar-chart')) {
  window.PolarChartElement = PolarChartElement
  window.customElements.define('polar-chart', PolarChartElement)
}
