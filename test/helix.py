import pygame, math

T = 1
A = 0.4
tau = 2 * math.pi

omega = tau / T


def y0(x):
	return A * math.sin(omega * x)
def dydx(x):
	return A * omega * math.cos(omega * x)
# last critical point <= xG
def xcritG(xG):
	f = omega * xG / tau
	f = (math.floor(2 * f - 0.5) + 0.5) / 2
	return tau * f / omega

# Given x > 0 return a value in [0, xmax) that's equal to x to first order.
def smoothclamp(x, xmax, a = 0.8):
	if xmax == 0:
		return 0
	return xmax * (1 - math.exp(-a * x / xmax))

def dx(xG, dyG, B):
#	return dyG * B / math.sqrt(1 + B ** 2)
#	if B * dyG > 0:
#		xA = cbeforeG(xG)
#	if abs(B) < 1:
#		B = 0

	xcG = xcritG(xG)
	
	dxG = dyG * B / (1 + B ** 2)
	
	if dxG < 0:
		dxGmax = xG - xcG
		dxG = -smoothclamp(-dxG, dxGmax)
	else:
		dxGmax = (xcG + T / 2) - xG
		dxG = smoothclamp(dxG, dxGmax)
	return dxG
#	return 0

def SconvertG(pG):
	xG, yG = pG
	y0G = y0(xG)
	B = dydx(xG)
	dyG = yG - y0G
	dxG = dx(xG, dyG, B)
	xS = xG + dxG
	y0S = y0(xS)
	d = math.hypot(xG - xS, yG - y0S)
	yS = math.copysign(d, dyG)
	return xS, yS

w, h = 1200, 800
VscaleG = 400
def GconvertV(pV):
	xV, yV = pV
	return (xV - w / 2) / VscaleG, -(yV - h / 2) / VscaleG

pygame.init()
screen = pygame.display.set_mode((w, h))
screen.fill((0, 0, 0))
for xV in range(w):
	for yV in range(h):
		pG = GconvertV((xV, yV))
		xS, yS = SconvertG(pG)
		checker = int(xS * 20 % 2) == int(yS * 20 % 2)
		a = 255 if checker else 100
		if abs(yS) > A/2:
			a *= 0.1
		if yS > 0:
			a *= 0.4
		a = int(a)
		color = min(50, a), min(50, a), a
		screen.set_at((xV, yV), color)
	pygame.display.flip()
while not any(event.type in (pygame.QUIT, pygame.KEYDOWN) for event in pygame.event.get()):
	pass

