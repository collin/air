const util = require('util');

function makeBuffer({displayWidth, displayHeight}) {
  let i = 0;
  let buffer = [];
  while (i < displayHeight) {
    buffer.push(Array.from({length: displayWidth}).fill(' '));
    i++;
  }

  return {
    buffer,
    updateBuffer(updates) {
      if (updates.displayWidth) displayWidth = updates.displayWidth;
      if (updates.displayHeight) displayHeight = updates.displayHeight;
    },
    writeToBuffer(startRow, startColumn, chars) {
      const line = buffer[startRow];
      Array.from(chars).forEach((char, index) => {
        const column = startColumn + index;
        if (line[column]) line[column] = char;
      });
    },
  };
}

const Hooks = new WeakMap();
function useEffect(callback, deps) {
  let index = Hooks.currentIndex;
  let hook = Hooks.current[index];
  let doRender = Hooks.doRender;
  if (hook === undefined) {
    hook = Hooks.current[index] = {
      callback,
      cleanup: undefined,
      deps: undefined,
    };
  }
  if (!util.isDeepStrictEqual(deps, hook.deps)) {
    if (hook.cleanup) hook.cleanup();
    hook.cleanup = callback();
    hook.deps = deps;
  }
  Hooks.currentIndex++;
}

let pendingHookUpdates = new Set();
let pendingHookUpdateScheduled = false;
function scheduleHookUpdate(doRender) {
  pendingHookUpdates.add(doRender);
  if (pendingHookUpdateScheduled === false) {
    pendingHookUpdateScheduled = true;
    setImmediate(() => {
      Array.from(pendingHookUpdates).forEach(renderer => renderer());
      pendingHookUpdates = new Set();
      pendingHookUpdateScheduled = false;
    });
  }
}
function useState(initialValue) {
  let index = Hooks.currentIndex;
  let hook = Hooks.current[index];
  let doRender = Hooks.doRender;
  if (hook === undefined) {
    hook = Hooks.current[index] = {value: initialValue};
  }
  Hooks.currentIndex++;
  return [
    hook.value,
    value => {
      hook.value = value;
      scheduleHookUpdate(doRender);
    },
  ];
}

function render(screen, app) {
  let {buffer, writeToBuffer, updateBuffer} = makeBuffer({
    displayWidth: screen.columns,
    displayHeight: screen.rows,
  });

  let renderTicks = 0;
  let linesDrawn = 0;
  function clearScreen() {
    while (linesDrawn > 0) {
      clearLine();
    }
    screen.cursorTo(0);
  }

  function clearLine() {
    screen.moveCursor(0, -1);
    screen.clearLine(0);
    linesDrawn -= 1;
  }

  function drawLines(content) {
    const lines = content.split('\n');
    linesDrawn += lines.length - 1;
    screen.write(content);
  }

  function draw(buffer) {
    clearScreen();
    drawLines(buffer.map(line => line.join('')).join('\n'));
  }

  function doRender() {
    updateBuffer({
      displayWidth: screen.columns,
      displayHeight: screen.rows,
    });
    if (!Hooks.has(app)) {
      Hooks.set(app, []);
    }
    Hooks.current = Hooks.get(app);
    Hooks.currentIndex = 0;
    Hooks.doRender = doRender;

    const components = createComponent(
      app({
        displayWidth: screen.columns,
        displayHeight: screen.rows,
        renderTicks: renderTicks,
      }),
    );
    const layout = calculateLayout(components);
    layout.writeToBuffer(buffer);
    draw(buffer, screen);
    renderTicks++;
  }
  setInterval(() => {}, 1000);
  screen.on('resize', doRender);
  doRender();
}

const calculateWidth = layout => {
  if (layout.component.hasIntrinsicWidth) {
    return layout.component.intrinsicWidth;
  } else {
    return layout.chlidren.reduce((sum, child) => {
      return prev + calculateWidth(child);
    }, 0);
  }
};
const calculateHeight = layout => {
  if (layout.component.hasIntrinsicHeight) {
    return layout.component.intrinsicHeight;
  } else {
    return layout.chlidren.reduce((sum, child) => {
      return prev + calculateHeight(child);
    }, 0);
  }
};

const calculateGeometry = layout => {
  return {
    width: calculateWidth(layout),
    height: calculateHeight(layout),
  };
};

const calculateLayout = component => {
  const layout = {
    component,
    children: component.children.map(calculateLayout),
  };
  layout.geometry = calculateGeometry(layout);
  return layout;
};

function createComponent(Klass, props = {}, children) {
  if (Array.isArray(children)) {
    children = children.map(createComponent);
  }
  if (children) {
    props.children = children;
  }
  return new Klass(props);
}

const Measure = {
  Percent: class {
    constructor(value) {
      this.value = value;
    }
  },
};

class Component {
  get children() {
    return this.props.children || [];
  }

  get hasIntrinsicWidth() {
    return true;
  }

  get intrinsicWidth() {
    return new Measure.Percent(100);
  }

  get hasIntrinsicHeight() {
    return false;
  }

  constructor(props) {
    this.props = props;
  }
}

class VBox extends Component {}
class HBox extends Component {}
class Text extends Component {
  get intrinsicWidth () {
    return this.textContent.length;
  }
  get hasIntrinsicHeight() {
    return true;
  }
  get intrinsicHeight () {
    return 1;
  }
  constructor(props) {
    super(props);
    this.textContent = props.children;
  }
}

const app = ({displayWidth, displayHeight, renderTicks}) => {
  const [time, setTime] = useState('STARTING TIME');
  const [rand, setRand] = useState(Math.random().toString());
  const [cancelCount, setCancelCount] = useState(0);

  useEffect(() => {
    let interval = setInterval(() => {
      setTime(new Date().toString());
      setRand(Math.random().toString());
    }, 1000);
    return () => {
      setCancelCount(cancelCount + 1);
      clearInterval.bind(null, interval);
    };
  }, [rand]);

  return [
    [
      VBox,
      {},
      [
        [
          HBox,
          {justifyContent: 'space-between'},
          [
            [Text, {}, 'top-left'],
            [Text, {}, 'top-right'],
          ],
        ],
        [
          VBox,
          {marginInlineStart: 10},
          [
            [Text, {}, time],
            [Text, {}, rand],
            [Text, {}, `${renderTicks} renders`],
            [Text, {}, `${cancelCount} timeouts cancelled`],
          ],
        ],
        [
          HBox,
          {justifyContent: 'space-between'},
          [
            [Text, {}, 'bottom-left'],
            [Text, {}, 'bottom-right'],
          ],
        ],
      ],
    ],
  ];
};

render(process.stdout, app);
