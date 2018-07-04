For the game we are currently developing: _They Arrive_, a big part of the gameplay revolves around the
map being different each time you play. The game is designed to be a quick casual arcade-style experience
and we wanted to avoid having the player be able to remember the locations of all of the useful pickups and
strategic points so that each play through is a slightly different experience.

Since at least the early 80s, techniques have been developed to generate, with increasing realism,
landscapes and terrains. Modern games have been able to procedurally generate entire galaxies,
where storing that much map content to disk would be prohibitively expensive. _They Arrive_ is designed to
be roughly 10km² of playable area and so this is far smaller in scale and gives us more freedom in
how we procedurally generate our maps.

## The Play Area

<figure>
    <img alt="Diagram of the play area" src="/img/play-area.svg"/>
    <p><strong>Figure 1.</strong> Diagram overview of the major areas with respects to gameplay and terrain generation.
</figure>

The map area we are trying to build consists of three major areas. The visible area, this is the greater
area which will be generated but may only require some of the more basic generation techniques, the player
will never end up in this area and no interactive features or passable terrain need exist here. The
boundary area, this is an area that can be traversed but in which no game detail will be found, it may
require slightly more complexity in generation techniques than the visible area, upon entering this area
a countdown begins and instruction for the player to return to the play area. Finally, we have the main
playable area, which contains landmarks that appear in random locations for each play, generated terrain
based on region properties and rules based placement of pickups, roads and buildings. The last area is
where the most of our techniques will come into play.

## Key Landmarks

The game has some key landmarks that have significance to the gameplay, this is where we will start our
procedural generation. We first put pins down where these key landmarks are to be located. We will define
these landmarks as: the mountain, the lake, the town, the forest and the clearing.

<figure>
    <img src="/img/landmarks.svg"/>
    <p><strong>Figure 2.</strong> Diagram of the key landmark sequence for the game.
</figure>

We will also define the rules:

1. The distance from the mountain to the clearing **must** be greater than the mountain to the
town and the town to the clearing, i.e. the town must be somewhere loosely between the mountain and the
clearing.
2. The distance from the town to the clearing **should** be greater than the town to the forest
and the forest to the clearing.
3. Also the distance from the mountain to the town **should** be greater than the mountain to
the lake and the lake to the town.
4. All landmarks **must** appear within the play area plus some distance; we wish to avoid
the occurrence of landmarks appearing at the very edge of the playable map.

One way we could do this is to pick five points at random within the play area (with the extra distance
from the boundary deducted) and then calculate the combinations landmark placements. The number of
combinations are reasonably small, <math><mrow>5!</mrow></math> (120), that we can do this. Then we
calculate a score based on the rules above, picking one of the highest scoring solutions at random. We
can also add a minimum score threshold, which if none of the combinations pass we pick a new set of
points and start again.

<figure>
    <div id="random-landmarks-interactive-figure"></div>
</figure>

The solution gives acceptable results, however, if we were to decide later to add more important landmarks
the problem space may grow very quickly.

Alternatives could be to instead take the five points as nodes of a complete digraph and expand these
into all of the edges, there are ten edges for a five node graph. We can then perform a search
to find the highest scoring combination. We could also place the points iteratively warping the space
to increase the likelihood of placing the points in valid locations.

## Voronoi Regions

From the landmark positions we then use Voronoi tessellation to convert the landmarks into regions. Each
region has specific properties, the terrain being generated will either be mountainous, a bowl shape for
the lake, possibly lots of flat area for the town, ridges and rocks in the forest and rolling hills in
the clearing. We will use the Voronoi regions to create areas in which to apply coefficients for our
terrain generation algorithm that produce the results we want for the particular area.

<figure>
    TODO voronoi tessellation
</figure>

Calculation using euclidian distance, squared distance and manhattan distance

## Generating Terrain

- Fractal terrain generation
- Power modification
- Perlin noise / Simplex noise
- Brownian surface
- Fourier transforms
- Voronoi
- Lloyd relaxation
- Thermal erosion
- Hydraulic erosion
- Fortune's algorithm
- Poisson Disks
- Recursive Wang Tiles
- Fractal Brownian Motion
- Inverse Fourier Transform
- Cholesky Decomposition
- Moore neighbourhood
- Von Neumann neighbourhood
- Modified von neumann neighbourhood
- Benes Forsbach method
- LOD
- Quadtree

- Mandelbrot
- Steven Fortune
- Georgy Voronoi
- Robert Brown
- Ken Musgrave
- Ken Perlin
- Stuart P. Lloyd
- Benoit Mandelbrot

## White Noise

White noise is generated by assigning a random height to each map cell.

<figure>
    <noscript>
        <img src="/img/white-noise-128.png"/>
    </noscript>
    <div id="white-noise-interactive-figure"></div>
</figure>

As you can see it isn't particularly useful for terrain generation because it lacks features and
is rather rough, this is because it has a constant power spectral density meaning that
there are no dominant frequencies or patterns in the signal, it lacks coherence.

What we want is something that more closely approximates how landmasses, mountains, valleys and
other natural terrain features form.

## Periodic Functions: Sine Wave

A sine wave describes a periodic oscillation, a repeating pattern based on a curve.

<figure>
    <noscript>
        <img src="/img/sine-wave-128-50.png"/>
    </noscript>
    <div id="sine-wave-interactive-figure"></div>
</figure>

```c
/**
 * Returns the height based on the product of a sine wave
 * periodic function with the passed frequency applied
 * separately to the x and y axis
 * @param x the x coordinate of the point from 0.0 to 1.0
 * @param y the y coordinate of the point from 0.0 to 1.0
 * @param f the frequency of the sine wave
 * @return the height from 0.0 to 1.0
 */
float sineWaveHeight(float x, float y, float f) {
    return sin(x * f) * sin(y * f) * 0.5 + 0.5;
}
```

```c
int main() {
    int w = 64, h = 64;
    float map[w * h];
    for (int i = 0; i < w; ++i) {
        for (int j = 0; j < h; ++j) {
            float x = (1.0f * i) / w;
            float y = (1.0f * j) / h;
            map[i + j * w] = sineWaveHeight(x, y, 8.0);
        }
    }
}
```

Like the white noise it is equally unsatisfactory for the purposes of terrain generation, giving
us a far too regular a pattern, more akin to a manufactured material and not the natural forms
we would expect from the processes of rock and land formation.

## Pink Noise

We have seen how white noise produces unsatisfactorily patternless noise, and a sine wave gives us
an unsatisfactory repetitive pattern, our next step is pink noise. Pink noise is a type of noise where
the power spectral density is inversely proportional to the frequency
<math><mfrac><mi>1</mi><mi>f</mi></mfrac></math> or
<math><msup><mi>f</mi><mn>-1</mn></msup></math>, as the frequency increases the amplitude decreases, this gives it a much smoother
result than white noise while still giving a natural and irregular noise pattern.

### Diamond-Square

The diamond-square algorithm is a midpoint displacement algorithm and one of the algorithms that can
be used to generate pink noise.

<figure>
    Diagram of diamond square algorithm
</figure>

The diamond-square algorithm works by subdividing the map recursively displacing new points based on
the heights of the points established in prior iterations. The first step is to assign height values
to the corners of the map, these can be random per corner, random for all corners or constant starting
height depending on the kind of result wanted.

These corner heights are then used in the diamond update, to calculate the height of the midpoint of
the map. The midpoint height is the mean height of the four corners plus a random offset, the displacement.
The displacement amount, or amplitude, is determined by the frequency, which in the first iteration is 1,
second iteration is 2, third is 4 and so on.

The height for the points that sit between each pair of corners are now calculated in the square update. The
height of these points are calculated from the pair of corners and the pairs of midpoints surrounding them.
Like the diamond update the height is the mean of the surrounding points plus a random offset scaled by the
frequency. Once complete we now have a new grid to begin our next iteration of the diamond-square algorithm.

<figure>
    <div id="diamond-square-interactive-figure"></div>
</figure>

Now we are starting to get somewhere, with pink noise somewhere between
<math><msup><mi>f</mi><mn>-1</mn></msup></math>
and
<math><msup><mi>f</mi><mn>-0.5</mn></msup></math>
we get something that starts to look like natural terrain. However, there you may notice that subtle ridges
or creases appearing, this is due to the biases present in the way the algorithm perturbs the heights along
a grid. Also the terrain is quite uniform in characteristic across the map and still relatively featureless,
this is because although midpoint displacement gives us coherence it is still homogenous.

## Voronoise Terrain

In addition for being useful for defining organic-like cells and region separations, Voronoi diagrams can
also be used, in combination with a noise function, to create features for our terrain, such as mountain
ranges and valleys.

Heights calculated based on distance from each feature point:

<math>
    h = <msub><mi>c</mi><mn>1</mn></msub><msub><mi>d</mi><mn>1</mn></msub> + 
    <msub><mi>c</mi><mn>2</mn></msub><msub><mi>d</mi><mn>2</mn></msub> +
    <msub><mi>c</mi><mn>3</mn></msub><msub><mi>d</mi><mn>3</mn></msub> + ... +
    <msub><mi>c</mi><mn>n</mn></msub><msub><mi>d</mi><mn>n</mn></msub>
</math>

Coefficients
<math><msub><mi>c</mi><mn>1</mn></msub> = -1</math>
and <math><msub><mi>c</mi><mn>2</mn></msub> = 1</math>
may be good for mountains.

## Erosion

### Thermal

### Hydraulic

### Wind

### Other

Erosion that simulates construction and development of an area, i.e. flattening areas to build homes.

## Interpolation

We will also likely want to interpolate with a generic region of terrain generation beyond
a certain distance from the landmark rather than having that particular type of terrain extending the
entire voronoi region.

Lerp

## LOD

The map is 10km², we may not be able to keep high level of detail noise maps in memory if say we tessellate
the mesh where a triangle is roughly 10cm², we are talking 10¹⁰ (10 billion vertices), each vertex is three
floats (perhaps doubles) we are looking at 120 - 240 gigabytes of memory to store all of these vertices at
that level of details. Therefore we will need to generate the higher level of detail noise on the fly, this
noise should be unaffected by any of our erosion algorithms. At a mesh of cells 1m² level of detail, we are
looking at 10⁷ vertices (10 million vertices) or 120 - 240 megabytes of memory. 10m² level of details might
be sufficient for our erosion passes which brings the total down to 12 - 24 megabytes.

Pseudorandomness and seeds (generating noise deterministically on the fly)

## References

- [Realtime Procedural Terrain Generation - Realtime Synthesis of Eroded Fractal Terrain for Use in Computer Games](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.366.6507) - Jacob Olsen
- http://www-cs-students.stanford.edu/~amitp/game-programming/polygon-map-generation/ - Amit Patel
- https://gamedev.stackexchange.com/questions/45403/algorithms-for-rainfall-river-creation-in-procedurally-generated-terrain
- http://simblob.blogspot.com/2010/09/polygon-map-generation-part-1.html
- https://en.wikipedia.org/wiki/Fortune's_algorithm
- http://jackromo.com/2016/04/10/random-terrain-generation-with-python-pink-noise/
- http://eastfarthing.com/blog/2015-04-21-noise/
- http://jmecom.github.io/blog/2015/diamond-square/
- http://blog.ivank.net/fortunes-algorithm-and-implementation.html