import { saveImagesController } from '../../certificates.di';

export const CertificatesRoutesExpress = () => {
  const { appendImages } = saveImagesController();

  appendImages();
};
