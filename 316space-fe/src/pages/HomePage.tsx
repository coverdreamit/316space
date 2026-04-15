import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const IMG = {
  hero: "/home/hero-bg.jpg",
  rentalBanner: "/home/rental-banner.jpg",
  gallery: "/home/gallery-main.jpg",
  floorplan: "/home/floorplan.png",
  map: "/home/contact-map.png",
} as const;

const GALLERY_FRAMES = [
  {
    src: "/home/51ae7f1f91bcc1adcaa7e88e67c6c76aa5cf7066.jpg",
    alt: "공간 갤러리 이미지 1",
  },
  {
    src: "/home/71452c591d3767da004105dc999f121e6a067d0b.jpg",
    alt: "공간 갤러리 이미지 2",
  },
  {
    src: "/home/8ed3cea858341eb947f24b319ff65f74781459cf.jpg",
    alt: "공간 갤러리 이미지 3",
  },
  {
    src: "/home/526a9a28ef06bbb525204ed19d54d60dd631cb42.jpg",
    alt: "공간 갤러리 이미지 4",
  },
  {
    src: "/home/a1dec223c6836951d4dbf42231e82feec9835d4e.jpg",
    alt: "공간 갤러리 이미지 5",
  },
] as const;

export default function HomePage() {
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [brokenSlides, setBrokenSlides] = useState<Record<string, true>>({});
  const slides = GALLERY_FRAMES;

  useEffect(() => {
    document.title = "316 spacebox";
  }, []);

  const goGallery = (dir: -1 | 1) => {
    setGalleryIndex((i) => {
      const n = slides.length;
      return (i + dir + n) % n;
    });
  };

  return (
    <main className="home-landing" data-figma-node="2001:4">
      <section className="home-hero" aria-label="메인 비주얼">
        <div className="home-hero__bg">
          <img
            src={IMG.hero}
            alt=""
            className="home-hero__bg-img"
            decoding="async"
          />
        </div>
        <div className="home-hero__overlay" aria-hidden />
        <div className="home-hero__inner">
          <p className="home-hero__tagline">
            서울 최고급 사운드 기반 퍼포먼스 스튜디오
          </p>
          <div className="home-hero__title-row">
            <span className="home-hero__mark" aria-hidden>
              316
            </span>
            <h1 className="home-hero__title">spacebox</h1>
          </div>
          <p className="home-hero__platform">PLATFORM FOR ARTISTS</p>
          <div className="home-hero__ctas">
            <Link className="home-hero__cta" to="/booking">
              예약하기
            </Link>
            <Link className="home-hero__cta" to="/studio">
              공간보기
            </Link>
          </div>
        </div>
      </section>

      <div className="home-body">
        <section className="home-rental" aria-labelledby="home-rental-heading">
          <div className="home-rental__banner">
            <img
              src={IMG.rentalBanner}
              alt=""
              className="home-rental__banner-img"
              decoding="async"
            />
            <div className="home-rental__overlay">
              <span className="home-rental__watermark" aria-hidden>
                spacebox
              </span>
              <div className="home-rental__copy">
                <p className="home-rental__sub">
                  핸드폰 거치대, 링라이트, 삼각대부터 요가매트, 폼롤러 등
                </p>
                <h2 id="home-rental-heading" className="home-rental__title">
                  Rental Service
                </h2>
                <Link className="home-rental__more" to="/contact">
                  MORE DETAIL
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="home-gallery" aria-label="공간 갤러리">
          <div className="home-gallery__frame">
            <img
              src={
                brokenSlides[slides[galleryIndex].src]
                  ? IMG.gallery
                  : slides[galleryIndex].src
              }
              alt={slides[galleryIndex].alt}
              className="home-gallery__img"
              decoding="async"
              onError={() =>
                setBrokenSlides((prev) => ({
                  ...prev,
                  [slides[galleryIndex].src]: true,
                }))
              }
            />
            <button
              type="button"
              className="home-gallery__nav home-gallery__nav--prev"
              aria-label="이전 이미지"
              onClick={() => goGallery(-1)}
            >
              ‹
            </button>
            <button
              type="button"
              className="home-gallery__nav home-gallery__nav--next"
              aria-label="다음 이미지"
              onClick={() => goGallery(1)}
            >
              ›
            </button>
          </div>
        </section>

        <section className="home-floor" aria-labelledby="home-floor-heading">
          <h2 id="home-floor-heading" className="home-section-title">
            Emergency Exit
          </h2>
          <div className="home-floor__figure">
            <img
              src={IMG.floorplan}
              alt="비상구 및 동선 안내 도면"
              className="home-floor__img"
              decoding="async"
            />
          </div>
        </section>

        <section
          className="home-contact"
          aria-labelledby="home-contact-heading"
        >
          <h2 id="home-contact-heading" className="home-section-title">
            Contact Us
          </h2>
          <div className="home-contact__grid">
            <div className="home-contact__text">
              <p>전화: 010-5746-8376</p>
              <p>카카오채널 / 인스타그램: (실제 계정으로 교체)</p>
              <p>
                주소: (도로명) 서울 서초구 서초중앙로24길 10, B2
                <br />
                (지번) 서울 서초구 서초동 1692-3
              </p>
              <p className="home-contact__note">
                24시간 연중무휴(시설 기준). 세부 휴무·점검 일정은 추후 이곳에
                반영해 주세요.
              </p>
            </div>
            <div className="home-contact__map">
              <img
                src={IMG.map}
                alt="오시는 길 지도"
                className="home-contact__map-img"
                decoding="async"
              />
            </div>
          </div>
        </section>

        <footer className="home-site-footer">
          <nav className="home-site-footer__nav" aria-label="푸터 링크">
            <Link to="/contact">개인정보처리방침</Link>
            <Link to="/about">가이드</Link>
            <Link to="/special-offers">리뷰이벤트</Link>
          </nav>
          <p className="home-site-footer__line">
            316spacebox · 주소 서울 서초구 서초중앙로24길 10, B2 · 전화
            010-5746-8376
          </p>
          <p className="home-site-footer__line">
            이메일 316spacebox@mail.com · 개인정보처리관리자 홍길동
            316spacebox@mail.com
          </p>
          <div className="home-site-footer__admin">
            <Link to="/admin" className="home-site-footer__admin-btn">
              관리자
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
