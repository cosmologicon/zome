simon.xcf - original Gimp file
simonA.png - export from Gimp after cropping
simonA?.png - export from Gimp after cropping and scaling
simonB*.png - corresponding simonA*.png files run through pngquant
simonC*.png - corresponding simonA*.png files run through pngquant --quality 10
simonD?.png - convert simonA.png -resize x1024 simonD0.png

simon?.png - pngquant simonD?.png with quality 40
compromise, gets it mostly right except for the necktie and pencil


pngquant --quality 50 zomeD0.png -o zome0.png
quality 40 took out a bit too much saturation in most of the colors.

