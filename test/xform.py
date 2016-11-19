# How does the directional derivative of a scalar field change with a linear transform?
# You'd think I should be able to work this out, but it's giving me a problem for some reason.

from __future__ import division
import math


def FT((xT, yT)):
	return sum(math.exp(-((xT - x0) ** 2 + (yT - y0) ** 2) / r ** 2)
		for x0, y0, r in [(0, 0, 1), (0.5, 0.1, 0.2), (0.1, 0.5, 0.6)])

# Given f((x, y)), return numerical partial derivatives d/dx f(p) and d/dy f(p) at (x, y)
def df(f, (x, y)):
	d = 0.0001
	return [
		(f((x + d, y)) - f((x - d, y))) / (2 * d),
		(f((x, y + d)) - f((x, y - d))) / (2 * d),
	]

def det((a, b, c, d)):
	return a * d - b * c

def times(x, y, *a):
	if a:
		return times(x, times(y, *a))
	xa, xb, xc, xd = x
	if len(y) == 2:
		ya, yb = y
		return xa * ya + xb * yb, xc * ya + xd * yb
	else:
		ya, yb, yc, yd = y
		return xa * ya + xb * yc, xa * yb + xb * yd, xc * ya + xd * yc, xc * yb + xd * yd

# (R(a))^-1 = R(-a)
def R(a):
	return math.cos(a), math.sin(-a), math.sin(a), math.cos(a)

# (S(q, kappa))^-1 = S(1/q, kappa)
def S(q, kappa = 0):
	return times(R(kappa), (q, 0, 0, 1/q), R(-kappa))


# pT = M pC
M = R(1)
Mi = R(-1)

M = S(1.2)
Mi = S(1.2)

M = S(1.2, 1)
Mi = S(1.2, 1)

M = times(S(1.2), R(1))
Mi = times(R(-1), S(1.2))

M = times(S(1.2, 1), R(0.3))
Mi = times(R(-0.3), S(1.2, 1))


print det(M), det(Mi)
print times(M, Mi)

FC = lambda pC: FT(times(M, pC))

pC = 1, 1
#print FC(pC)
print df(FC, pC)
#print df(FT, times(M, pC))
print times(Mi, df(FT, times(M, pC)))




