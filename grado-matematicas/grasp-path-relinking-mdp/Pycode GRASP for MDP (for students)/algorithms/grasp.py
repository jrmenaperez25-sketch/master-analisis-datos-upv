from constructives import cgrasp
from localsearch import lsbestimp
import time

def execute(inst, tiempo, alpha):
    best = None
    start_time = time.time()  # Registra el tiempo inicial
    while time.time() - start_time < tiempo:  # Comprueba si el tiempo transcurrido es menor que el tiempo límite
        sol = cgrasp.construct(inst, alpha)
        lsbestimp.improve(sol)
        if best is None or best['of'] < sol['of']:
            best = sol
    return best
