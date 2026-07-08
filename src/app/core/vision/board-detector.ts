import {
  Injectable,
  inject,
} from '@angular/core';

import {
  BoardCandidateDetector,
} from './board-candidate-detector';

import {
  BoardCandidate,
} from '../models/board-candidate.model';

import {
  DetectedBoard,
} from '../models/dart-board.model';
import {BoardValidator} from './board-validator';
import {
  ImagePreprocessor,
} from './image-preprocessor';
declare const cv: any;

@Injectable({
  providedIn: 'root',
})
export class BoardDetector {

  private readonly candidateDetector =
    inject(
      BoardCandidateDetector
    );
  private readonly validator =
    inject(
      BoardValidator
    );
  private readonly preprocessor =
    inject(
      ImagePreprocessor
    );

  detect(
    imageData: ImageData,
    sensitivity: number,
  ): DetectedBoard | null {

    if (
      !imageData ||
      imageData.width === 0 ||
      imageData.height === 0
    ) {

      return null;

    }


    const gray =
      this.preprocessor
        .preprocess(
          imageData
        );
    const threshold =
      this.preprocessor.preprocessForContours(
        imageData
      );
    try {



      const candidates =
        this.candidateDetector.detect(
          gray,
          threshold,
          imageData.width,
          imageData.height,
          sensitivity
        );

      if (
        candidates.length === 0
      ) {

        return null;

      }

      return this.validator.validate(
        candidates,
        imageData.width,
        imageData.height,

      );

    } finally {

      gray?.delete();
      threshold?.delete();

    }

  }

}
