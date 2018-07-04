From our landmarks, that we created in our previous post, we want to create regions where each
region has specific properties, the terrain being generated will either be mountainous, a bowl shape for
the lake, possibly lots of flat area for the town, ridges and rocks in the forest and rolling hills in
the clearing. We will use the regions to specify coefficients for our terrain generation algorithm that
produce the results we want for the particular area.

A Voronoi tessellation is a way of producing regions from a set of feature points, every point within a
region is closer to its feature point than any other feature point. It can be used for maps, such as
finding the nearest coffee shop. It works by first producing a Voronoi tessellation of the map from all
of the coffee shops, then when a user asks where their nearest coffee shop is we can easily find which
region their current location falls within and return the coffee shop associated to that region rather
than compare the distances for each coffee shop each time. 

<figure>
    Voronoi coffee
</figure>

Voronoi tessellation is also known as Dirichlet tessellation, René Descartes is the first known person
to use what we now know as Voronoi tessellation in the 17th century and the mathematician Gustav Lejeune
Dirichlet was informally using similar diagrams for his studies in the mid 19th century, it wasn't until
1908 that Georgy Voronoy produced a formal definition for the diagram.

To produce a Voronoi tessellation efficiently we can use Fortune's algorithm, defined by Steven Fortune
in 1986. It uses a sweeping line to process the points or sites and a trailing beach line to construct
the diagram. The beach line is required to handle the fact that points ahead of the sweep line
are able to influence the results of the diagram behind the sweep line. The beach line is constructed
from parabola that indicate the furthest extents of the diagram that have been completed given
the current sweep line position.

<figure>
    Anatomy of Fortune's algorithm
</figure>

- Sweep line
- Beach line
- Parabola
- Site
- Edge
- Intersection
- Bounds

### Site

### Edge

### Events

The events are the discrete steps of the sweep line, when the sweep line reaches one of the sites or
intersection points this is an event. Events can be added and removed, i.e. in certain situations an
intersection point will be added but on later processing of sites may turn out to be a false event
and needs to be removed.

<figure>
    Intersection point added and removed
</figure>

### Sweep line

Priority queue for the events, binary heap. We only need the root element each time.

<figure>
    Binary heap priority queue
</figure>

Deletions, some sort of set, hash set? Can use object pointer as identity?

### Beach line

Red black tree (a self-balancing binary tree) can be used for the beach line. We need to traverse left
and right, between edges and parabola to find the parabola under a given site.

<figure>
    Red-black tree
</figure>

The quadratic formula to find the x extents of each parabola given y

### Bounds

Finishing up, terminating edges, closing region paths.

<figure>
    TODO voronoi tessellation
</figure>

Applying this to our landmarks step.

<figure>
    Voronoi tessellation random landmarks
</figure>

Calculation using euclidian distance, squared distance and manhattan distance. Square root is an
expensive operation.

In the next post we will be looking at noise and how we can use noise to generate terrains

[IV - Noise](/noise)

## References

- [A Sweepline Algorithm for Voronoi Diagrams](https://dl.acm.org/citation.cfm?id=10549) - Steven Fortune (1987) 