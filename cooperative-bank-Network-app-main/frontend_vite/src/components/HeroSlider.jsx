
import React from "react";
import Slider from "react-slick";
import { Typography, Box } from "@mui/joy";

const slides = [
  {
    image: "https://images.indianexpress.com/2018/06/urban-cooperative-bank.jpg",
    text: "Connecting Every Cooperative Bank in India",
  },
  {
    image: "https://etimg.etb2bimg.com/photo/123879184.cms",
    text: "Empowering Rural Growth Through Financial Inclusion",
  },
  {
    image: "https://media.licdn.com/dms/image/v2/D4D12AQEUhcrxkFpU9g/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1720243010589?e=2147483647&t=IvjH2fifKhGu0FQI09PsOjtTFFGTtFsBL1_ypqb_8us&v=beta",
    text: "One Network • One Vision • Collective Prosperity",
  },
  {
    image: "https://img.etimg.com/thumb/width-1200,height-900,imgsize-41640,resizemode-75,msid-111409180/industry/banking/finance/banking/cooperative-banks-fy24-deposits-growth-outpaces-credit.jpg",
    text: "Strengthening India’s Cooperative Banking Ecosystem",
  },
];

const HeroSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    pauseOnHover: false,
    fade: true,
  };

  return (
    <Box sx={{ position: "relative", mb: 6 }}>
      <Slider {...settings}>
        {slides.map((slide, index) => (
          <Box
            key={index}
            sx={{
              position: "relative",
              height: { xs: 250, md: 380 },
              backgroundImage: `url(${slide.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "lg",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "rgba(0, 0, 0, 0.55)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                color: "white",
                px: 3,
              }}
            >
              <Typography
                level="h2"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.5rem", md: "2.25rem" },
                }}
              >
                {slide.text}
              </Typography>
            </Box>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default HeroSlider;
