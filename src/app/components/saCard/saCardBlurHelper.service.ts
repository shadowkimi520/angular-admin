/**
 * @file 卡片内部服务
 * @module app/component/card/service
 * @author Surmon <https://github.com/surmon-china>
 */

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { BgMetrics } from './bgMetrics';

@Injectable()
export class SaCardBlurHelperService {

  private image: HTMLImageElement;
  private imageLoadSubject: Subject<void>;

  public init() {
    this._genBgImage();
    this._genImageLoadSubject();
  }

  public bodyBgLoad(): Subject<void> {
    return this.imageLoadSubject;
  }

  public getBodyBgImageSizes(): BgMetrics {
    const elemW = document.documentElement.clientWidth;
    const elemH = document.documentElement.clientHeight;
    if (elemW <= 640) {
      return;
    }
    const imgRatio = (this.image.height / this.image.width);
    const containerRatio = (elemH / elemW);

    let finalHeight, finalWidth;
    if (containerRatio > imgRatio) {
      finalHeight = elemH;
      finalWidth = (elemH / imgRatio);
    } else {
      finalWidth = elemW;
      finalHeight = (elemW * imgRatio);
    }
    return { width: finalWidth, height: finalHeight, positionX: (elemW - finalWidth) / 2, positionY: (elemH - finalHeight) / 2};
  }

  private _genBgImage(): void {
    this.image = new Image();
    const computedStyle = getComputedStyle(document.body.querySelector('main'), ':before');
    this.image.src = computedStyle.backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2');
  }

  private _genImageLoadSubject(): void {
    this.imageLoadSubject = new Subject<void>();
    this.image.onerror = _ => {
      this.imageLoadSubject.complete();
    };
    this.image.onload = () => {
      this.imageLoadSubject.next(null);
      this.imageLoadSubject.complete();
    };
  }
}
