In the [last post](/procedural-terrain-generation/) we looked at the overview of the different
game areas for They Arrive, in this post we are focusing on the playable area and the key
landmarks. There are five key landmarks that have significance to the gameplay, this is where
we will start our procedural generation. We first put pins down where these key landmarks are
to be located. We will define these landmarks as: the mountain, the lake, the town, the forest
and the clearing.

<figure>
    <img src="/procedural-terrain-generation/img/landmarks.svg" alt="Landmark sequence"/>
    <p><strong>Figure 1.</strong> The key landmark sequence for <em>They Arrive</em> gameplay.
</figure>

All landmarks **must** appear within the play area plus some distance; we wish to avoid
the occurrence of landmarks appearing at the very edge of the playable map, also we will
define a minimum distance that each landmark **must** be from each other. In addition
to those rules we will define some other rules as:

1. The distance from the mountain to the clearing **must** be greater than the mountain to the
town and the town to the clearing, i.e. the town must be somewhere loosely between the mountain and the
clearing.
2. The distance from the town to the clearing **must** be greater than the town to the forest
and the forest to the clearing.
3. Also the distance from the mountain to the town **must** be greater than the mountain to
the lake and the lake to the town.

One way we could do this is to pick five points at random within the play area (with the extra distance
from the boundary deducted) and then calculate every permutation of landmark placements. The number of
these permutations are reasonably small, <math><mn>5</mn><mo>!</mo></math> (120). Then we validate the
path passes the rules above and if it does return it. If none of the combinations pass the rules we pick
a new set of points and start again.

<figure>
    <div id="random-landmarks-interactive-figure"></div>
</figure>

Whilst sometimes the results seem acceptable, we get some configurations where the lake is closer to the
clearing than the mountain and the forest is closer to the mountain than the clearing. The rules may be
too loose, if we tweak our rules a bit:

1. The mountain and the clearing **must** be the furthest two points of the sequence.
2. The lake **must** be closer to the mountain than any of the other points.
3. The forest **must** be closer to the clearing than any of the other points.
4. The lake and the forest **must** be further from each other than the town.

<figure>
    <div id="random-landmarks-interactive-figure-v2"></div>
</figure>

The results do seem to be consistently better than the first solution but in some cases is taking a rather
large amount of attempts to produce a valid combination of points. The rules may be too strict.

If we take a step back, we can see an optimal solution can be defined as the shortest path from `A` to `E` that
visits all landmarks once where `A` and `E` are the furthest points apart. This is a variation on the travelling
salesman problem and in graph theory this kind of path is known as the shortest Hamiltonian path, named after
William Rowan Hamilton who invented a puzzle based on creating a path across every point on a dodecahedron.

Unfortunately the constraint that every landmark must appear in the path exactly once rules out Dijkstra's and A*
search algorithms. Our graph is an undirected (you can travel in both directions between the landmarks) complete
(every landmark has an edge with every other landmark) graph, which means that we at least know that Hamiltonian
paths exist but finding the shortest one between two landmarks is non-trivial.

We can brute force the search by trying all permutations, we are already doing so for our other
variations and so we know the time to compute will be reasonable for the limited number of landmarks we have.

<figure>
    <div id="random-landmarks-interactive-figure-v3"></div>
</figure>

The solution is now giving us the optimal results we were looking for in a reasonable amount of time (a couple of
milliseconds), however, if we were to decide later to add more landmarks the problem space will grow very quickly.
In fact, it will grow so quickly that if we simply double the number of landmarks to 10 the solution is no longer
workable as over 3 million permutations need to be checked. Luckily for now we only have 5 landmarks.

In the next post we will explore how to split the map into regions based on these landmarks using a
technique called Voronoi Tessellation.
