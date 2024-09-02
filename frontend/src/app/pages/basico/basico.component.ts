import { Component, OnInit } from '@angular/core';
import { BasicService } from '../../service/basic.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Asegúrate de importar esto
import { API_ROUTES } from '../../config/api.routes';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-basico',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './basico.component.html',
  styleUrls: ['./basico.component.css'],
})
export class BasicoComponent implements OnInit {
  basicaData: any[] = []; // Variable para almacenar los datos
  responseMessage: string = ''; // Variable para almacenar el mensaje de respuesta de la API
  public formBasico!: FormGroup; // Variable para el formulario de datos básicos

  constructor(
    private formBuilder: FormBuilder,
    private basicoService: BasicService
  ) {}

  /**
   *
   * función para cargar los datos de la API
   * @returns void
   */
  loadData(): void {
    this.basicoService
      .getData(`${API_ROUTES.BASE_URL}${API_ROUTES.BASICA}`)
      .subscribe(
        (data: any[]) => {
          this.basicaData = data.map((item) => ({
            id: item._id,
            name: item.name,
            years: item.years,
          }));
        },
        (error: any) => {
          console.error('Error al obtener los datos:', error);
        }
      );
  }

  /**
   *
   * función para eliminar los datos básicos por ID
   * @param id del dato a eliminar
   * @returns promesa con el mensaje de respuesta
   */
  async deleteBasicaData(id: string): Promise<void> {
    try {
      // Mostrar confirmación antes de eliminar
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'No podrás revertir esta acción.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });

      // Si el usuario confirma la eliminación
      if (result.isConfirmed) {
        this.responseMessage = await this.basicoService.deleteDataByID(
          id,
          `${API_ROUTES.BASE_URL}${API_ROUTES.BASICA}`
        );

        // Mostrar mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: this.responseMessage,
        });

        // Recargar datos
        this.loadData();
      }
    } catch (error) {
      this.responseMessage =
        (error as any).error?.message || 'Error desconocido';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.responseMessage,
      });
    }
  }

  /**
   * función para cargar los datos de la API al iniciar el componente
   * @returns void
   */
  ngOnInit(): void {
    this.loadData();

    this.formBasico = this.formBuilder.group({
      name: ['', [Validators.required]],
      years: ['', [Validators.required, Validators.min(18)]],
    });
  }

  /**
   *
   * función para enviar los datos básicos
   * @returns promesa con el mensaje de respuesta
   */
  async send(): Promise<void> {
    try {
      this.responseMessage = await this.basicoService.createData(
        this.formBasico.value,
        `${API_ROUTES.BASE_URL}${API_ROUTES.BASICA}`
      );
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: this.responseMessage,
      });
      this.loadData();
    } catch (error) {
      this.responseMessage =
        (error as any).error?.message || 'Error desconocido';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.responseMessage,
      });
    }
  }

  /**
   *
   * función para editar los datos básicos
   * @param item datos a editar
   * @returns promesa con el mensaje de respuesta
   */
  async updateBasicaData(item: any): Promise<void> {
    // Inicializa el formulario con los datos actuales
    this.formBasico.setValue({
      name: item.name,
      years: item.years,
    });

    // Muestra el SweetAlert2 con el formulario de edición
    const { value: formValues } = await Swal.fire({
      title: 'Actualizar Datos',
      html: `
        <form id="updateForm" class="swal2-form">
          <input id="nameupdate" class="swal2-input" placeholder="Name" value="${item.name}" />
          <input id="yearsupdate" class="swal2-input" type="number" placeholder="Years" value="${item.years}" />
        </form>
      `,
      focusConfirm: false,
      preConfirm: () => {
        return {
          name: (document.getElementById('nameupdate') as HTMLInputElement)
            .value,
          years: (document.getElementById('yearsupdate') as HTMLInputElement)
            .value,
        };
      },
    });

    if (formValues) {
      try {
        this.responseMessage = await this.basicoService
          .updateData(
            item.id,
            formValues,
            `${API_ROUTES.BASE_URL}${API_ROUTES.BASICA}`
          )
          .toPromise();
        Swal.fire({
          icon: 'success',
          title: 'Actualizado',
        });
        this.loadData();
      } catch (error) {
        this.responseMessage =
          (error as any).error?.message || 'Error desconocido';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: this.responseMessage,
        });
      }
    }
  }
}
