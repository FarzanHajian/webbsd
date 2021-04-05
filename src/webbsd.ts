import interact from 'interactjs';

interface BsdCancelableEventArg { cancel: boolean }
interface BsdResizedEventArg { startY: number, endY: number, isUpwards: boolean }
type BsdCancelableEvent = (e: BsdCancelableEventArg) => void;
type BsdVoidEvent = () => void;
type BsdResizedEvent = (e: BsdResizedEventArg) => void;

interface BsdOptions {
    isModeless?: boolean,
    height?: string,
    offset?: string,
    bgColor?: string,
    handleColor?: string,
    onShown?: BsdVoidEvent,
    onShowing?: BsdCancelableEvent,
    onHiding?: BsdCancelableEvent,
    onHidden?: BsdVoidEvent,
    onResized?: BsdResizedEvent
}

export class BottomSheetDialog {

    private static _instance: BottomSheetDialog = null;

    static get instance(): BottomSheetDialog {
        return this._instance;
    }

    static createInstance(elementId: string, initialOptions: BsdOptions): BottomSheetDialog {
        this._instance = new BottomSheetDialog(elementId, initialOptions);
        return this._instance;
    };

    private _element: HTMLElement = null;
    private _isOpen: boolean = false;
    private _defaultOptions: BsdOptions = {
        isModeless: false,
        height: 'max-content',
        offset: '0px',
        bgColor: '#1a212e',
        handleColor: '#445473',
        onShown: null,
        onShowing: null,
        onHiding: null,
        onHidden: null,
        onResized: null
    };
    private _initialOptions: BsdOptions;
    private _options: BsdOptions;
    private _uiTemplate = `
        <aside class="bsd-popup" tabindex="-1" role="dialog" aria-labelledby="modal-label" aria-hidden="true">
            <div class="bsd-resize-handle"></div>
            <div class="bsd-content"></div>
        </aside>
        <span class="bsd-close-button" aria-hidden="true" onclick="webbsd.BottomSheetDialog.instance.hide()"></span>
    `;

    get isOpen(): boolean {
        return this._isOpen;
    }

    get element(): HTMLElement {
        return this._element;
    }

    private constructor(elementId: string, initialOptions: BsdOptions) {
        // NOTE: DO NOT USE THE CONSTRUCTOR DIRECTLY. USE "createInstance()" INSTEAD.

        this._element = document.getElementById(elementId);
        if (!this._element) throw 'Invalid element selected for BSD';

        if (initialOptions) {
            this._initialOptions = { ...initialOptions };
            this._options = { ...this._options, ...initialOptions };
        }

        this._initialize();
    }


    toggle(isOpen: boolean, showOptions?: BsdOptions): void {
        if (this._isOpen === isOpen) return;

        this._isOpen = isOpen;
        const bsd = this._element;
        const cssClasses = bsd.classList;
        const popup = document.querySelector<HTMLElement>('.bsd-overlay .bsd-popup');

        if (this._isOpen) {
            this._options = { ...this._defaultOptions, ...this._initialOptions };
            if (showOptions) this._options = { ...this._options, ...showOptions };

            if (this._options.onShowing) {
                const e: BsdCancelableEventArg = { cancel: false };
                this._options.onShowing(e);
                if (e.cancel) return;
            }

            bsd.style.setProperty('--offset', this._options.offset);
            bsd.style.setProperty('--bgColor', this._options.bgColor);
            bsd.style.setProperty('--handleColor', this._options.handleColor);

            popup.style.height = (this._options?.height ?? 'max-content');
            if (popup.style.height === 'max-content') {
                this._setContentOverflow('visible');  // Forcing the BSD to show the whole content
            }

            if (this._options.isModeless) {
                cssClasses.add('modeless');
                this._setPopupTopVariable(popup);
            } else {
                cssClasses.remove('modeless');
                bsd.style.setProperty('--popup-top', '');
            }

            cssClasses.add('open');

            if (this._options.onShown) this._options.onShown();
        } else {
            if (this._options.onHiding) {
                const e: BsdCancelableEventArg = { cancel: false };
                this._options.onHiding(e);
                if (e.cancel) return;
            }

            cssClasses.remove('open');

            if (this._options.onHidden) this._options.onHidden();
        }
    }

    showContent(htmlContent: string, showOptions?: BsdOptions): void {
        const contentElement = document.querySelector<HTMLElement>('.bsd-overlay .bsd-popup .bsd-content');
        contentElement.innerHTML = htmlContent;
        this.toggle(true, showOptions);
    }

    hide(): void {
        this.toggle(false);
        const contentElement = document.querySelector<HTMLElement>('.bsd-overlay .bsd-popup .bsd-content');
        contentElement.innerHTML = '';
    }

    setHeight(height: string): void {
        const popupElement = document.querySelector<HTMLElement>('.bsd-overlay .bsd-popup');
        popupElement.style.height = height;
        this._setPopupTopVariable();
    }

    private _initialize(): void {
        this._element.classList.add('bsd-overlay');
        this._element.innerHTML = this._uiTemplate;

        const moveCallback = this._interactMoveCallback.bind(this);
        const endCallback = this._interactEndCallback.bind(this);

        interact(document.querySelector<HTMLElement>('.bsd-overlay .bsd-popup'))
            .resizable({
                edges: { top: true },
                listeners: {
                    move: moveCallback,
                    end: endCallback
                },
                modifiers: [
                    interact.modifiers.restrictEdges({ outer: 'parent' }),
                    interact.modifiers.restrictSize({ min: { height: 100, width: null } })
                ],

                inertia: false
            })
    }

    private _interactMoveCallback(event: any) {
        if (this._options.isModeless) this._element.classList.add('resizing');
        event.target.style.height = event.rect.height + 'px';
    }

    private _interactEndCallback(event: any) {
        if (this._options.isModeless) this._setPopupTopVariable();

        this._setContentOverflow('auto');   // Allowing scrollbars to be availabe when needed

        if (this._options.onResized) {
            this._options.onResized({
                startY: event.clientY0,
                endY: event.client.y,
                isUpwards: event.clientY0 > event.client.y
            });
        }

        if (this._options.isModeless) this._element.classList.remove('resizing');
    }

    private _setPopupTopVariable(popup?: HTMLElement): void {
        if (!popup) popup = document.querySelector<HTMLElement>('.bsd-overlay .bsd-popup');
        this._element.style.setProperty('--popup-top', `calc(${window.innerHeight}px - (${popup.style.height} + ${this._options.offset}))`);
    }

    private _setContentOverflow(overflow: 'visible' | 'auto') {
        const contentElement = document.querySelector<HTMLElement>('.bsd-overlay .bsd-popup .bsd-content')
        contentElement.style.overflowY = overflow;
    }
}