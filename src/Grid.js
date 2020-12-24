import Draw from './Draw';
import Generate from './Generate';
import { initialOptions } from './helpers';

export default class {
  constructor(grid, options) {
    this.grid = grid;
    this.options = options;
    this.generateInstance = null;
    this.drawInstance = null;
    this.generate();
  }

  generate() {
    this.generateInstance = new Generate(
      this.options.cellNum, 
      this.options.coord
    );
    this.drawInstance = new Draw(this.generateInstance.generate());
    this.drawInstance.initialDraw(this.grid);
  }

  resetGrid() {
    this.grid.innerHTML = '';
    this.grid.className = undefined;
    this.drawInstance.destroy();
    this.options =  { ...this.options, ...initialOptions() };
    this.generate();
  }

  getOption(optionName) {
    return this.options[optionName];
  }

  setOption(optionName, optionValue) {
    this.options[optionName] = optionValue;
  }

  updateGrid(elem) {
    const { found, dragged } = this.options;
    if (!dragged) return;
    if (found && elem.classList.contains('block')) return;
    const elemIndex = +elem.getAttribute('coord');
    if (this.options.Shift) {
      this.setOption(
        'endCoord',
        this.drawInstance.drawEnd(elemIndex, this.options.endCoord && this.options.coord(this.options.endCoord))
      );
      found && this.redrawAlgo();
    } else if (this.options.Ctrl) {
      this.drawInstance.drawWall(elemIndex);
    } else {
      this.setOption(
        'startCoord',
        this.drawInstance.drawStart(elemIndex, this.options.startCoord && this.options.coord(this.options.startCoord))
      );
      found && this.redrawAlgo();
    }
  }

  startAlgo() {
    if (this.getOption('started')) return;
    this.setOption('started', true);
    this.grid.className = 'no-click';
    const { searchFunction, endCoord, startCoord, cellNum, coord } = this.options;
    if (endCoord && startCoord) {
      const history = searchFunction(this.drawInstance.getCells(), startCoord, endCoord, cellNum);
      const historyValues = [...history.keys()];
      let endComputed = coord(endCoord);
      this.drawInstance.showAlgo(historyValues, 0, async () => {
        this.drawInstance.drawWay(this.grid, history, endComputed, (found) => {
          this.setOption('found', found);
          found && this.grid.classList.remove('no-click');
        });
      });
    }
  }

  redrawAlgo() {
    const { searchFunction, endCoord, startCoord, cellNum, coord, found } = this.options;
    if (endCoord && startCoord && found) {
      const history = searchFunction(this.drawInstance.getCells(), startCoord, endCoord, cellNum);
      const historyValues = [...history.keys()];
      let endComputed = coord(endCoord);
      this.drawInstance.clearChecked();
      this.drawInstance.showAlgoNow(historyValues);
      this.drawInstance.drawWayNow(history, endComputed);
    }
  }
} 