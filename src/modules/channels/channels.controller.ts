import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelDto, CreateChannelDto } from '../../contracts';
import { ChatGateway } from '../chat/chat.gateway';

@Controller('channels')
export class ChannelsController {
  constructor(
    private readonly channelsService: ChannelsService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Get()
  async getAllChannels(): Promise<ChannelDto[]> {
    return await this.channelsService.getChannels();
  }

  @Get('/default')
  async getDefaultChannel(): Promise<ChannelDto> {
    const channel = await this.channelsService.getDefaultChannel();
    if (channel === null) {
      throw new NotFoundException(`Default channel does not exist`);
    }
    return channel;
  }

  @Get(':id')
  async getChannel(@Param('id') id: string): Promise<ChannelDto> {
    const channel = await this.channelsService.getChannelById(id);
    if (channel === null) {
      throw new NotFoundException(`Could not get channel with id: '${id}'`);
    }
    return channel;
  }

  @Post()
  async createChannel(
    @Body() createChannelDto: CreateChannelDto,
  ): Promise<ChannelDto> {
    const newChannel = await this.channelsService.createChannel(
      createChannelDto,
    );
    await this.chatGateway.handleActiveClientsOnNewChannelCreated(newChannel);
    return newChannel;
  }
}
