import {
  LitElement,
  css,
  html
} from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";

class NextBusCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {}
    };
  }

  connectedCallback(){
    super.connectedCallback();
    this._startInterval();
  }

  disconnectedCallback(){
    super.disconnectedCallback();
    this._clearInterval();
  }

  _startInterval() {
    var date = new Date();
    this._clearInterval();
    this._timeout = window.setTimeout(() => {
      this._interval = window.setInterval(() => this.requestUpdate(), 60000);
      this.requestUpdate();
    }, (60 - date.getSeconds()) * 1000);
  }

  _clearInterval() {
    window.clearTimeout(this._timeout);
    window.clearInterval(this._interval);
    this._timeout = undefined;
    this._interval = undefined;
  }

  render() {
    if (!this.config || !this.hass) {
      return html``;
    }

    if (!this.hass.states[this.config.entity]) {
      return html`
        <hui-warning>
          ${this.hass.config.state !== "NOT_RUNNING"
            ? this.hass.localize(
                "ui.panel.lovelace.warning.entity_not_found",
                "entity",
                this.config.entity || "[empty]"
              )
            : this.hass.localize(
                "ui.panel.lovelace.warning.starting"
              )
          }
        </hui-warning>
      `;
    }

    let { attributes: { predictions } } = this.hass.states[this.config.entity];
    predictions = predictions || [];

    predictions = predictions.filter(prediction => {
      if (!Array.isArray(this.config.include) || !this.config.include.length) {
        return true;
      }
      return this.config.include.includes(prediction.line);
    });
    predictions = predictions.filter(prediction => {
      if (!Array.isArray(this.config.exclude) || !this.config.exclude.length) {
        return true;
      }
      return !this.config.exclude.includes(prediction.line);
    });

    return html`
      <ha-card>
        ${this.config.title
          ? html`
            <h1 class="card-header">
              <div class="name">
                ${this.config.title}
              </div>
            </h1>
            `
          : ""
        }
        <div class="card-content">
          ${predictions.length
            ? this._renderPredictions(predictions)
            : html`
              No departures to show
            `
          }
        </div>
      </ha-card>
    `;
  }

  _renderPredictions(predictions) {
    const now = new Date();
    return predictions.slice(0, this.size).map((prediction) => {
      const departure = new Date(prediction.departure);
      return html`
        <div class="prediction">
          <div class="prediction__line">
            ${prediction.line}
          </div>
          <div class="prediction__destination">
            ${prediction.destination}
          </div>
          <div class="prediction__time">
            ${departure.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            <span>(+ ${prediction.delay / 60})</span>
          </div>
          <div class="prediction__minutes">
            ${Math.ceil((departure - now) / 1000 / 60)}
            <span>min</span>
          </div>
        </div>
      `;
    })
  }

  async updated() {
    await new Promise((r) => setTimeout(r, 0));
    this._setEqualWidth(this.root.querySelectorAll('.prediction__line'));
    this._setEqualWidth(this.root.querySelectorAll('.prediction__minutes'));
  }

  _setEqualWidth(elements) {
    elements.forEach(element => {
      element.style.width = "auto";
    });

    const maxWidth = Math.max(...[].map.call(elements, element => {
      return parseFloat(window.getComputedStyle(element).width);
    }));

    elements.forEach(element => {
      element.style.width = maxWidth + "px";
    });
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this.config = config;
    this.size = this.config.size || 5;
  }

  getCardSize() {
    return this.size;
  }

  get root() {
    return this.shadowRoot || this
  }

  static get styles() {
    return css`
      card-header {
        display: flex;
        justify-content: space-between;
      }
      .card-header .name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .prediction {
        display: flex;
        padding-bottom: 20px;
      }
      .prediction:last-child {
        padding-bottom: 0;
      }
      .prediction .prediction__line {
        flex-shrink: 0;
        font-size: 20px;
        padding-right: 16px;
        text-align: right;
      }
      .prediction .prediction__destination {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .prediction .prediction__time {
        border-right: 1px solid #C4C4C4;
        color: var(--secondary-text-color);
        flex-shrink: 0;
        margin-left: auto;
        padding: 0 16px 0 16px;
        text-align: right;
        white-space: nowrap;
      }
      @media (max-width: 400px) {
        .prediction .prediction__time {
          display: none;
        }
      }
      @media (min-width: 600px) and (max-width: 870px) {
        .prediction .prediction__time {
          display: none;
        }
      }
      .prediction .prediction__minutes {
        flex-shrink: 0;
        font-size: 28px;
        text-align: right;
        padding-left: 16px;
      }
      @media (max-width: 400px) {
        .prediction .prediction__minutes {
          margin-left: auto;
        }
      }
      @media (min-width: 600px) and (max-width: 870px) {
        .prediction .prediction__minutes {
          margin-left: auto;
        }
      }
      .prediction .prediction__minutes span {
        font-size: 16px;
      }
    `;
  }
}

customElements.define('next-bus-card', NextBusCard);
