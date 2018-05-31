# What is the nearest point on the parabola y = Ax^2 + Bx to the point (0, y0), to leading order
# in A and B? That is, find a = a(A,B) and b = b(A,B) such that:

#   x0(y0) = a y0^2 + b y0

# is the best second-order fit to x0(y0).
# This turns out to be suprisingly hard to calculate, so I'm just going to do in emperically.

#import scipy.optimize, numpy, math
from decimal import *
import math

getcontext().prec = 1000

p1 = Decimal(1) / 10
phi = (Decimal(5).sqrt() + 1) / 2

def f(x):
	return A * x ** 2 + B * x
def xnearest(y):
	def d2(x):
		return x ** 2 + (y - f(x)) ** 2
	xhi = Decimal(10)
	xlo = Decimal(-10)
	x0 = xhi - (xhi - xlo) / phi
	x1 = xlo + (xhi - xlo) / phi
	while abs(x1 - x0) > p1 ** 200:
		if d2(x0) < d2(x1):
			xhi = x1
		else:
			xlo = x0
		x0 = xhi - (xhi - xlo) / phi
		x1 = xlo + (xhi - xlo) / phi
	return (xlo + xhi) / 2

def qterm(d = p1 ** 20):
	x0 = xnearest(-d)
	x1 = xnearest(d)
	return (x0 + x1) / (2 * d ** 2)

def qofB():
	A = Decimal(1)
	return float(qterm() / A)

A = Decimal(0.5)
B = Decimal("0.6")

if False:
	for A in [-10, -5, -1, -0.1, 0.1, 1, 5, 10]:
		A = Decimal(A)
		print(float(A), float(qterm() / A))
	
		# B = -1: qterm = -1/8 A
		# B = 0.5: qterm = 0.448 A
		# B = 1: qterm = 0.125 A
		# B = 1.5: qterm = -0.010923... A
		# B = 2: qterm = -0.032 A
		# B = 3: qterm = -0.021 A

#for B in [0.1, 0.2, 0.3, 0.5, 1, 2, 3, 5, 7, 10, 20]:
for B in [1.1 ** x for x in range(-50, 50)]:
	B = Decimal(B)
	print(float(B), float(qofB()))

exit()

def xnearest(y):
	def f(x):
		yofx = A * x ** 2 + B * x
		return x ** 2 + (y - yofx) ** 2
	result = scipy.optimize.minimize(f, 0, tol=1e-4)
#	print(A, B, y, result.x[0])
	return result.x[0]

def leadingterm(n = 1):
	ys = [0.001 * j for j in range(-100, 101)]
	xs = [xnearest(y) for y in ys]
	fit = numpy.polyfit(ys, xs, n)
	return fit[0]

def qterm(d = 0.001):
	y0 = xnearest(-d)
	y1 = xnearest(d)
	return (y0 + y1) / (2 * d ** 2)

if False:
	# b = B / (1 + B^2)
	A = 0
	for B in [-10, -5, -1, -0.1, 0, 0.1, 1, 5, 10]:
		b = leadingterm()
		print(B, b, B / (1 + B ** 2))

if True:
	B = 1
	for A in [-10, -5, -1, -0.1, 0, 0.1, 1, 5, 10]:
		for n in (-1, -1.5, -2, -2.5, -3, -3.5, -4, -4.5, -5):
			print(A, n, qterm(10 ** n))
		print()



